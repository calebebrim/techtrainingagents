import { useEffect, useMemo, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { UserRole } from '../../../../types';
import {
  SeatUsage,
  SystemRole,
  SystemUser,
  UserStatus
} from '../types';

interface SystemUsersQueryData {
  organizations?: Array<{
    id: string;
    name?: string | null;
    users?: Array<{
      id: string;
      name?: string | null;
      email?: string | null;
      roles?: string[] | null;
      status?: string | null;
      groups?: Array<{
        id: string;
        name?: string | null;
      }> | null;
    }> | null;
  }> | null;
  globalSystemUsers?: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    roles?: string[] | null;
    status?: string | null;
    groups?: Array<{
      id: string;
      name?: string | null;
    }> | null;
  }> | null;
}

const DEFAULT_SYSTEM_ROLE: SystemRole = 'TECHNICAL_STAFF';
const GLOBAL_ORGANIZATION_LABEL = 'Global';

const normalizeRole = (role?: string | null): SystemRole | null => {
  if (!role) {
    return null;
  }
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return 'SYSTEM_ADMIN';
    case UserRole.ORG_ADMIN:
    case 'Organization Admin':
      return 'ORG_ADMIN';
    case UserRole.COURSE_COORDINATOR:
    case 'Course Coordinator':
      return 'COURSE_COORDINATOR';
    case UserRole.COLLABORATOR:
    case 'Technical Staff':
      return 'TECHNICAL_STAFF';
    default:
      return null;
  }
};

const normalizeStatus = (status?: string | null): UserStatus => {
  const value = status?.toLowerCase();
  if (value === 'suspended' || value === 'invited') {
    return value;
  }
  if (value === 'inactive') {
    return 'inactive';
  }
  return 'active';
};

const computeSeatUsage = (roles: SystemRole[], status: UserStatus): number => {
  if (status !== 'active') {
    return 0;
  }
  return roles.length > 0 ? 1 : 0;
};

const mapUsersFromQuery = (data?: SystemUsersQueryData): SystemUser[] => {
  const mapUserRecord = (
    user: { id: string; name?: string | null; email?: string | null; roles?: string[] | null; status?: string | null; groups?: Array<{ name?: string | null }> | null },
    organizationId: string | null,
    organizationName: string
  ): SystemUser => {
    const normalizedRoles = (user.roles ?? [])
      .map(normalizeRole)
      .filter((role): role is SystemRole => Boolean(role));

    const normalizedStatus = normalizeStatus(user.status);
    const appliedRoles = normalizedRoles.length > 0 ? normalizedRoles : [DEFAULT_SYSTEM_ROLE];
    const seatsUsed = computeSeatUsage(appliedRoles, normalizedStatus);

    return {
      id: user.id,
      name: user.name || 'Unnamed User',
      email: user.email || '—',
      organizationId,
      organization: organizationName,
      roles: appliedRoles,
      status: normalizedStatus,
      lastActive: '—',
      groups: (user.groups ?? [])
        .map((group) => group.name || '')
        .filter(Boolean),
      seatsUsed
    };
  };

  const organizationUsers = (data?.organizations ?? []).flatMap((organization) => {
    const orgName = organization.name || 'Unknown Organization';
    return (organization.users ?? []).map((user) =>
      mapUserRecord(user, organization.id, orgName)
    );
  });

  const globalUsers = (data?.globalSystemUsers ?? []).map((user) =>
    mapUserRecord(user, null, GLOBAL_ORGANIZATION_LABEL)
  );

  return [...organizationUsers, ...globalUsers];
};

const deriveSeatUsage = (users: SystemUser[]): SeatUsage => {
  const totals = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.organization] = (acc[user.organization] ?? 0) + user.seatsUsed;
    return acc;
  }, {});

  return Object.entries(totals)
    .map(([organization, seats]) => ({ organization, seats }))
    .filter((entry) => entry.seats > 0)
    .sort((a, b) => b.seats - a.seats)
    .slice(0, 4);
};

const deriveStats = (users: SystemUser[]) => {
  const totalSystemAdmins = users.filter(
    (user) => user.status === 'active' && user.roles.includes('SYSTEM_ADMIN')
  ).length;
  const totalOrganizations = new Set(
    users
      .map((user) => user.organizationId)
      .filter((organizationId): organizationId is string => Boolean(organizationId))
  ).size;
  const totalUsers = users.filter((user) => user.seatsUsed > 0).length;
  const activeSeats = users.reduce((acc, user) => acc + user.seatsUsed, 0);

  return {
    totalSystemAdmins,
    totalOrganizations,
    totalUsers,
    activeSeats
  };
};

export const SYSTEM_USERS_QUERY = gql`
  query SystemUsers {
    organizations {
      id
      name
      users {
        id
        name
        email
        roles
        status
        groups {
          id
          name
        }
      }
    }
    globalSystemUsers {
      id
      name
      email
      roles
      status
      groups {
        id
        name
      }
    }
  }
`;

export const useSystemUsers = () => {
  const { data, loading, error } = useQuery<SystemUsersQueryData>(SYSTEM_USERS_QUERY, {
    fetchPolicy: 'network-only'
  });
  const [users, setUsers] = useState<SystemUser[]>([]);

  useEffect(() => {
    setUsers(mapUsersFromQuery(data));
  }, [data]);

  const userOrganizations = useMemo(() => {
    return Array.from(new Set(users.map((user) => user.organization))).sort();
  }, [users]);

  const seatUsage = useMemo(() => deriveSeatUsage(users), [users]);

  const stats = useMemo(() => deriveStats(users), [users]);

  return {
    users,
    setUsers,
    userOrganizations,
    seatUsage,
    stats,
    loading,
    error
  };
};
