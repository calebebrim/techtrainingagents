const { Op } = require('sequelize');
const { Organization, User, Course, CourseTopic, UserCourse, Group, UserGroup } = require('../models');

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
    organizations: () => Organization.findAll({ order: [['name', 'ASC']] }),

    organization: (_, { id, slug }) => {
      const where = {};
      if (id) {
        where.id = id;
      }
      if (slug) {
        where.slug = slug;
      }
      return Organization.findOne({ where });
    },

    courses: (_, { organizationId, search }) => {
      const where = {
        organizationId
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

    course: (_, { id }) => Course.findByPk(id),

    users: (_, { organizationId }) => User.findAll({
      where: { organizationId },
      order: [['name', 'ASC']]
    }),

    user: (_, { id }) => User.findByPk(id),

    groups: (_, { organizationId }) => Group.findAll({
      where: { organizationId },
      order: [['name', 'ASC']]
    }),

    enrollments: async (_, { organizationId, courseId, userId }) => {
      const where = {};
      if (courseId) {
        where.courseId = courseId;
      }
      if (userId) {
        where.userId = userId;
      }

      const include = buildEnrollmentInclude();

      if (organizationId) {
        include[1].where = { organizationId };
        include[1].required = true;
      }

      return UserCourse.findAll({
        where,
        include
      });
    },

    organizationDashboard: async (_, { organizationId }) => {
      const organization = await Organization.findByPk(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      const [users, courses] = await Promise.all([
        User.findAll({ where: { organizationId } }),
        Course.findAll({ where: { organizationId } })
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

    employeeCourseScores: async (_, { organizationId, courseId }) => {
      const include = buildEnrollmentInclude();
      include[1].where = {
        organizationId,
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

    me: async () => {
      return User.findOne();
    }
  },

  Mutation: {
    createOrganization: async (_, { input }) => {
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

    createCourse: async (_, { input }) => {
      const course = await Course.create({
        organizationId: input.organizationId,
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

    addCourseTopic: async (_, { input }) => {
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

    enrollUser: async (_, { input }) => {
      const [enrollment] = await UserCourse.findOrCreate({
        where: {
          userId: input.userId,
          courseId: input.courseId
        },
        defaults: {
          status: input.status || 'IN_PROGRESS',
          progress: typeof input.progress === 'number' ? input.progress : 0,
          score: input.score ?? null
        },
        include: buildEnrollmentInclude()
      });

      return UserCourse.findByPk(enrollment.id, {
        include: buildEnrollmentInclude()
      });
    },

    updateEnrollmentScore: async (_, { enrollmentId, progress, score, topicScores }) => {
      const enrollment = await UserCourse.findByPk(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
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

    createGroup: async (_, { input }) => {
      const group = await Group.create({
        organizationId: input.organizationId,
        name: input.name,
        description: input.description,
        isSystem: false
      });
      return group;
    },

    assignUserToGroup: async (_, { userId, groupId }) => {
      await UserGroup.findOrCreate({
        where: { userId, groupId },
        defaults: { userId, groupId }
      });
      return Group.findByPk(groupId);
    },

    removeUserFromGroup: async (_, { userId, groupId }) => {
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
