const { GraphQLError } = require('graphql');

const Roles = {
  SYS_ADMIN: 'System Admin',
  ORG_ADMIN: 'Administrator',
  COURSE_COORDINATOR: 'Course Coordinator',
  COLLABORATOR: 'Technical Staff'
};

const createError = (message, code) =>
  new GraphQLError(message, {
    extensions: { code }
  });

const ensureArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (_err) {
      return value.split(',').map((entry) => entry.trim());
    }
  }
  return [];
};

const getUserRoles = (user) => ensureArray(user?.roles);

const getEffectiveUser = (context) => context?.user ?? context?.authUser ?? null;

const getAuthUser = (context) => context?.authUser ?? context?.user ?? null;

const hasRole = (user, role) => getUserRoles(user).includes(role);

const hasAnyRole = (user, roles) => getUserRoles(user).some((role) => roles.includes(role));

const requireAuth = (context) => {
  const user = getEffectiveUser(context);
  if (!user) {
    throw createError('You must be authenticated to access this resource.', 'UNAUTHENTICATED');
  }
  return user;
};

const requireSystemAdmin = (context) => {
  const authUser = getAuthUser(context);
  if (!authUser) {
    throw createError('You must be authenticated to access this resource.', 'UNAUTHENTICATED');
  }
  if (!hasRole(authUser, Roles.SYS_ADMIN)) {
    throw createError('You do not have permission to perform this action.', 'FORBIDDEN');
  }
  return authUser;
};

const requireOrgMember = (context) => {
  const user = requireAuth(context);
  if (hasRole(user, Roles.SYS_ADMIN)) {
    throw createError('System administrators cannot access organization resources.', 'FORBIDDEN');
  }
  return user;
};

const requireOrgRoles = (context, allowedRoles) => {
  const user = requireOrgMember(context);
  if (!hasAnyRole(user, allowedRoles)) {
    throw createError('You do not have permission to perform this action.', 'FORBIDDEN');
  }
  return user;
};

const ensureSameOrganization = (user, organizationId) => {
  if (!organizationId) {
    throw createError('Organization identifier is required.', 'BAD_USER_INPUT');
  }
  if (user.organizationId !== organizationId) {
    throw createError('You are not allowed to access this organization.', 'FORBIDDEN');
  }
};

const isSystemAdmin = (user) => hasRole(user, Roles.SYS_ADMIN);

module.exports = {
  Roles,
  createError,
  requireAuth,
  requireSystemAdmin,
  requireOrgMember,
  requireOrgRoles,
  ensureSameOrganization,
  hasAnyRole,
  hasRole,
  isSystemAdmin,
  ensureArray,
  getAuthUser
};
