const { Op } = require('sequelize');
const { Organization, User, Course, CourseTopic, UserCourse, Group, UserGroup } = require('../models');
const {
  Roles,
  createError,
  requireAuth,
  requireSystemAdmin,
  requireOrgMember,
  requireOrgRoles,
  ensureSameOrganization,
  hasAnyRole,
  isSystemAdmin
} = require('../auth/permissions');

const slugify = (value) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const mapTopicScores = (scores = []) => {
  if (!Array.isArray(scores)) {
    return [];
  }
  return scores.map((score) => ({
    topicId: score.topicId,
    topicName: score.topicName || '',
    score: typeof score.score === 'number' ? score.score : -1
  }));
};

const computeCourseMetrics = async (courseId) => {
  const enrollments = await UserCourse.findAll({
    where: { courseId },
    include: [
      { model: User, as: 'user' }
    ]
  });

  if (enrollments.length === 0) {
    return {
      averageScore: null,
      completionRate: 0,
      enrolledCount: 0,
      employees: []
    };
  }

  const scores = enrollments
    .map((enrollment) => typeof enrollment.score === 'number' ? enrollment.score : null)
    .filter((value) => value !== null);

  const averageScore = scores.length > 0
    ? scores.reduce((acc, value) => acc + value, 0) / scores.length
    : null;

  const completionRate = enrollments.length > 0
    ? enrollments.filter((enrollment) => enrollment.status === 'COMPLETED').length / enrollments.length
    : 0;

  const employees = enrollments.map((enrollment) => ({
    user: enrollment.user,
    overallScore: typeof enrollment.score === 'number' ? enrollment.score : null,
    progress: enrollment.progress,
    status: enrollment.status,
    topicScores: mapTopicScores(enrollment.topicScores)
  }));

  return {
    averageScore,
    completionRate,
    enrolledCount: enrollments.length,
    employees
  };
};

const getCourseMetrics = async (course) => {
  if (!course._metricsCache) {
    course._metricsCache = await computeCourseMetrics(course.id);
  }
  return course._metricsCache;
};

const healthFromScore = (score) => {
  if (score === null || typeof score === 'undefined') {
    return 'YELLOW';
  }
  if (score >= 75) {
    return 'GREEN';
  }
  if (score >= 50) {
    return 'YELLOW';
  }
  return 'RED';
};

const buildEnrollmentInclude = () => ([
  {
    model: User,
    as: 'user',
    include: [{ model: Organization, as: 'organization' }]
  },
  {
    model: Course,
    as: 'course',
    include: [
      { model: Organization, as: 'organization' },
      { model: CourseTopic, as: 'topics' }
    ]
  }
]);

const resolvers = {
  Query: {
    organizations: (_parent, _args, context) => {
      requireSystemAdmin(context);
      return Organization.findAll({ order: [['name', 'ASC']] });
    },

    organization: async (_, { id, slug }, context) => {
      const user = requireAuth(context);
      const where = {};
      if (id) {
        where.id = id;
      }
      if (slug) {
        where.slug = slug;
      }
      const organization = await Organization.findOne({ where });
      if (!organization) {
        return null;
      }
      if (!isSystemAdmin(user)) {
        ensureSameOrganization(user, organization.id);
      }
      return organization;
    },

    courses: async (_, { organizationId, search }, context) => {
      const user = requireOrgMember(context);
      const resolvedOrganizationId = organizationId || user.organizationId;
      ensureSameOrganization(user, resolvedOrganizationId);

      const where = {
        organizationId: resolvedOrganizationId
      };

      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } }
        ];
      }

      return Course.findAll({
        where,
        include: [{ model: CourseTopic, as: 'topics' }],
        order: [
          ['title', 'ASC'],
          [{ model: CourseTopic, as: 'topics' }, 'position', 'ASC']
        ]
      });
    },

    course: async (_, { id }, context) => {
      const user = requireOrgMember(context);
      const course = await Course.findByPk(id);
      if (!course) {
        return null;
      }
      ensureSameOrganization(user, course.organizationId);
      return course;
    },

    users: async (_, { organizationId }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const resolvedOrganizationId = organizationId || user.organizationId;
      ensureSameOrganization(user, resolvedOrganizationId);
      return User.findAll({
        where: { organizationId: resolvedOrganizationId },
        order: [['name', 'ASC']]
      });
    },

    user: async (_, { id }, context) => {
      const requester = requireAuth(context);
      if (requester.id === id) {
        return User.findByPk(id);
      }
      if (isSystemAdmin(requester)) {
        return User.findByPk(id);
      }
      if (!hasAnyRole(requester, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR])) {
        throw createError('You do not have permission to view this user.', 'FORBIDDEN');
      }
      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        return null;
      }
      ensureSameOrganization(requester, targetUser.organizationId);
      return targetUser;
    },

    groups: async (_, { organizationId }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const resolvedOrganizationId = organizationId || user.organizationId;
      ensureSameOrganization(user, resolvedOrganizationId);
      return Group.findAll({
        where: { organizationId: resolvedOrganizationId },
        order: [['name', 'ASC']]
      });
    },

    enrollments: async (_, { organizationId, courseId, userId }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const resolvedOrganizationId = organizationId || user.organizationId;
      ensureSameOrganization(user, resolvedOrganizationId);

      const where = {};
      if (courseId) {
        where.courseId = courseId;
      }
      if (userId) {
        where.userId = userId;
      }

      const include = buildEnrollmentInclude();
      include[1].where = { organizationId: resolvedOrganizationId };
      include[1].required = true;

      return UserCourse.findAll({
        where,
        include
      });
    },

    organizationDashboard: async (_, { organizationId }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const resolvedOrganizationId = organizationId || user.organizationId;
      ensureSameOrganization(user, resolvedOrganizationId);

      const organization = await Organization.findByPk(resolvedOrganizationId);
      if (!organization) {
        throw createError('Organization not found', 'NOT_FOUND');
      }

      const [users, courses] = await Promise.all([
        User.findAll({ where: { organizationId: resolvedOrganizationId } }),
        Course.findAll({ where: { organizationId: resolvedOrganizationId } })
      ]);

      const stats = [];
      let scoreAccumulator = 0;
      let scoreCount = 0;

      for (const course of courses) {
        const metrics = await computeCourseMetrics(course.id);
        if (metrics.averageScore !== null) {
          scoreAccumulator += metrics.averageScore;
          scoreCount += 1;
        }
        stats.push({
          course,
          averageScore: metrics.averageScore,
          enrolledCount: metrics.enrolledCount,
          completionRate: metrics.completionRate,
          health: healthFromScore(metrics.averageScore)
        });
      }

      const averageScore = scoreCount > 0 ? scoreAccumulator / scoreCount : null;

      return {
        organization,
        totalEmployees: users.length,
        activeCourses: courses.length,
        averageScore,
        courseStats: stats
      };
    },

    employeeCourseScores: async (_, { organizationId, courseId }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const resolvedOrganizationId = organizationId || user.organizationId;
      ensureSameOrganization(user, resolvedOrganizationId);

      const include = buildEnrollmentInclude();
      include[1].where = {
        organizationId: resolvedOrganizationId,
        ...(courseId ? { id: courseId } : {})
      };
      include[1].required = true;

      const enrollments = await UserCourse.findAll({ include });

      return enrollments.map((enrollment) => ({
        user: enrollment.user,
        overallScore: typeof enrollment.score === 'number' ? enrollment.score : null,
        progress: enrollment.progress,
        status: enrollment.status,
        topicScores: mapTopicScores(enrollment.topicScores)
      }));
    },

    me: (_parent, _args, context) => requireAuth(context)
  },

  Mutation: {
    createOrganization: async (_, { input }, context) => {
      requireSystemAdmin(context);
      const organization = await Organization.create({
        name: input.name,
        slug: input.slug || slugify(input.name),
        cnpj: input.cnpj,
        domain: input.domain,
        description: input.description,
        logoUrl: input.logoUrl
      });
      return organization;
    },

    createCourse: async (_, { input }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const organizationId = input.organizationId || user.organizationId;
      ensureSameOrganization(user, organizationId);
      const course = await Course.create({
        organizationId,
        title: input.title,
        description: input.description,
        thumbnailUrl: input.thumbnailUrl,
        category: input.category,
        level: input.level || 'intermediate',
        status: input.status || 'draft',
        estimatedHours: input.estimatedHours
      });
      return course;
    },

    addCourseTopic: async (_, { input }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const course = await Course.findByPk(input.courseId);
      if (!course) {
        throw createError('Course not found', 'NOT_FOUND');
      }
      ensureSameOrganization(user, course.organizationId);
      const topic = await CourseTopic.create({
        courseId: input.courseId,
        name: input.name,
        summary: input.summary,
        position: typeof input.position === 'number' ? input.position : 0,
        dependencies: input.dependencies || [],
        estimatedMinutes: input.estimatedMinutes
      });
      return topic;
    },

    enrollUser: async (_, { input }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const targetUser = await User.findByPk(input.userId);
      if (!targetUser) {
        throw createError('User not found', 'NOT_FOUND');
      }
      ensureSameOrganization(user, targetUser.organizationId);

      const course = await Course.findByPk(input.courseId);
      if (!course) {
        throw createError('Course not found', 'NOT_FOUND');
      }
      ensureSameOrganization(user, course.organizationId);

      if (course.organizationId !== targetUser.organizationId) {
        throw createError('User and course must belong to the same organization.', 'FORBIDDEN');
      }

      const [enrollment] = await UserCourse.findOrCreate({
        where: {
          userId: input.userId,
          courseId: input.courseId
        },
        defaults: {
          status: input.status || 'IN_PROGRESS',
          progress: typeof input.progress === 'number' ? Math.max(0, Math.min(1, input.progress)) : 0,
          score: input.score ?? null
        },
        include: buildEnrollmentInclude()
      });

      return UserCourse.findByPk(enrollment.id, {
        include: buildEnrollmentInclude()
      });
    },

    updateEnrollmentScore: async (_, { enrollmentId, progress, score, topicScores }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN, Roles.COURSE_COORDINATOR]);
      const enrollment = await UserCourse.findByPk(enrollmentId, {
        include: buildEnrollmentInclude()
      });
      if (!enrollment) {
        throw createError('Enrollment not found', 'NOT_FOUND');
      }

      const courseOrganizationId = enrollment.course?.organizationId;
      if (courseOrganizationId) {
        ensureSameOrganization(user, courseOrganizationId);
      } else {
        const course = await Course.findByPk(enrollment.courseId);
        if (!course) {
          throw createError('Course not found', 'NOT_FOUND');
        }
        ensureSameOrganization(user, course.organizationId);
      }

      const updates = {};
      if (typeof progress === 'number') {
        updates.progress = Math.max(0, Math.min(1, progress));
      }
      if (typeof score === 'number') {
        updates.score = score;
      }
      if (Array.isArray(topicScores)) {
        updates.topicScores = topicScores.map((entry) => ({
          topicId: entry.topicId,
          topicName: entry.topicName || '',
          score: entry.score
        }));
      }

      await enrollment.update(updates);

      return UserCourse.findByPk(enrollmentId, {
        include: buildEnrollmentInclude()
      });
    },

    createGroup: async (_, { input }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN]);
      const organizationId = input.organizationId || user.organizationId;
      ensureSameOrganization(user, organizationId);
      const group = await Group.create({
        organizationId,
        name: input.name,
        description: input.description,
        isSystem: false
      });
      return group;
    },

    assignUserToGroup: async (_, { userId, groupId }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN]);
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw createError('Group not found', 'NOT_FOUND');
      }
      ensureSameOrganization(user, group.organizationId);

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        throw createError('User not found', 'NOT_FOUND');
      }
      if (targetUser.organizationId !== group.organizationId) {
        throw createError('Cannot assign users from another organization to this group.', 'FORBIDDEN');
      }

      await UserGroup.findOrCreate({
        where: { userId, groupId },
        defaults: { userId, groupId }
      });
      return Group.findByPk(groupId);
    },

    removeUserFromGroup: async (_, { userId, groupId }, context) => {
      const user = requireOrgRoles(context, [Roles.ORG_ADMIN]);
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw createError('Group not found', 'NOT_FOUND');
      }
      ensureSameOrganization(user, group.organizationId);

      const targetUser = await User.findByPk(userId);
      if (targetUser && targetUser.organizationId !== group.organizationId) {
        throw createError('Cannot remove users from another organization.', 'FORBIDDEN');
      }

      const deleted = await UserGroup.destroy({
        where: { userId, groupId }
      });
      return deleted > 0;
    }
  },

  Organization: {
    users: (organization) => {
      if (organization.users) {
        return organization.users;
      }
      return User.findAll({
        where: { organizationId: organization.id },
        order: [['name', 'ASC']]
      });
    },
    courses: (organization) => {
      if (organization.courses) {
        return organization.courses;
      }
      return Course.findAll({
        where: { organizationId: organization.id },
        order: [['title', 'ASC']]
      });
    },
    groups: (organization) => {
      if (organization.groups) {
        return organization.groups;
      }
      return Group.findAll({
        where: { organizationId: organization.id },
        order: [['name', 'ASC']]
      });
    },
    dashboard: (organization) => {
      return resolvers.Query.organizationDashboard(null, { organizationId: organization.id });
    }
  },

  User: {
    roles: (user) => {
      if (Array.isArray(user.roles)) {
        return user.roles;
      }
      if (typeof user.roles === 'string') {
        try {
          const parsed = JSON.parse(user.roles);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    },
    organization: (user) => {
      if (user.organization) {
        return user.organization;
      }
      return Organization.findByPk(user.organizationId);
    },
    groups: async (user) => {
      if (user.groups) {
        return user.groups;
      }
      const groups = await user.getGroups();
      return groups;
    },
    enrollments: (user) => {
      if (user.enrollments) {
        return user.enrollments;
      }
      return UserCourse.findAll({
        where: { userId: user.id },
        include: buildEnrollmentInclude()
      });
    }
  },

  Group: {
    organization: (group) => {
      if (group.organization) {
        return group.organization;
      }
      return Organization.findByPk(group.organizationId);
    },
    members: (group) => {
      if (group.members) {
        return group.members;
      }
      return group.getMembers({ order: [['name', 'ASC']] });
    },
    isSystem: (group) => group.isSystem
  },

  CourseTopic: {
    dependencies: (topic) => (Array.isArray(topic.dependencies) ? topic.dependencies : [])
  },

  Course: {
    organization: (course) => {
      if (course.organization) {
        return course.organization;
      }
      return Organization.findByPk(course.organizationId);
    },
    topics: (course) => {
      if (course.topics) {
        return course.topics;
      }
      return CourseTopic.findAll({
        where: { courseId: course.id },
        order: [['position', 'ASC']]
      });
    },
    enrollments: (course) => {
      if (course.enrollments) {
        return course.enrollments;
      }
      return UserCourse.findAll({
        where: { courseId: course.id },
        include: buildEnrollmentInclude()
      });
    },
    averageScore: async (course) => {
      const metrics = await getCourseMetrics(course);
      return metrics.averageScore;
    },
    completionRate: async (course) => {
      const metrics = await getCourseMetrics(course);
      return metrics.completionRate;
    },
    enrolledCount: async (course) => {
      const metrics = await getCourseMetrics(course);
      return metrics.enrolledCount;
    },
    health: async (course) => {
      const metrics = await getCourseMetrics(course);
      return healthFromScore(metrics.averageScore);
    },
    employees: async (course) => {
      const metrics = await getCourseMetrics(course);
      return metrics.employees;
    }
  },

  Enrollment: {
    topicScores: (enrollment) => mapTopicScores(enrollment.topicScores),
    user: (enrollment) => {
      if (enrollment.user) {
        return enrollment.user;
      }
      return User.findByPk(enrollment.userId);
    },
    course: (enrollment) => {
      if (enrollment.course) {
        return enrollment.course;
      }
      return Course.findByPk(enrollment.courseId);
    },
    startedAt: (enrollment) => enrollment.startedAt ? enrollment.startedAt.toISOString() : null,
    completedAt: (enrollment) => enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
    lastAccessedAt: (enrollment) => enrollment.lastAccessedAt ? enrollment.lastAccessedAt.toISOString() : null
  }
};

module.exports = resolvers;
