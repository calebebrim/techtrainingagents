import React, { useEffect, useMemo, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheckIcon, OfficeBuildingIcon, UserGroupIcon, AdjustmentsIcon, ChartBarIcon } from '../../components/icons';
import SystemUserTable from './components/SystemUserTable';
import {
    SystemRole,
    UserStatus,
    SystemUser,
    roleLabels,
    roleOrder,
    statusStyles,
} from './systemPermissionsTypes';

interface Invite {
    id: string;
    email: string;
    organization: string;
    sentAt: string;
    role: SystemRole;
}

const pendingInvites: Invite[] = [
    {
        id: 'invite-1',
        email: 'ana.lima@alphametal.com',
        organization: 'AlphaMetal',
        sentAt: '1 day ago',
        role: 'ORG_ADMIN',
    },
    {
        id: 'invite-2',
        email: 'diego.silva@techspark.io',
        organization: 'TechSpark Labs',
        sentAt: '3 hours ago',
        role: 'TECHNICAL_STAFF',
    },
];

const groupOptions = [
    'System Maintainers',
    'Org Owners',
    'Security Reviewers',
    'Compliance Review',
    'Readonly',
];

const SYSTEM_USERS_QUERY = gql`
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
    }
`;

const normalizeRole = (role?: string | null): SystemRole | null => {
    if (!role) return null;
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

const mapUsersFromQuery = (data?: {
    organizations?: Array<{
        name?: string | null;
        users?: Array<{
            id: string;
            name?: string | null;
            email?: string | null;
            roles?: string[] | null;
            status?: string | null;
            groups?: Array<{ id: string; name?: string | null }> | null;
        }> | null;
    }> | null;
}): SystemUser[] => {
    if (!data?.organizations) {
        return [];
    }

    return data.organizations.flatMap((organization) => {
        const orgName = organization.name || 'Unknown Organization';
        return (organization.users ?? []).map<SystemUser>((user) => {
            const normalizedRoles = (user.roles ?? [])
                .map(normalizeRole)
                .filter((role): role is SystemRole => Boolean(role));

            const normalizedStatus = normalizeStatus(user.status);
            const appliedRoles = normalizedRoles.length > 0 ? normalizedRoles : ['TECHNICAL_STAFF'];
            const seatsUsed = computeSeatUsage(appliedRoles, normalizedStatus);

            return {
                id: user.id,
                name: user.name || 'Unnamed User',
                email: user.email || '—',
                organization: orgName,
                roles: appliedRoles,
                status: normalizedStatus,
                lastActive: '—',
                groups: (user.groups ?? []).map((group) => group.name || '').filter(Boolean),
                seatsUsed,
            };
        });
    });
};

const SystemPermissionsScreen: React.FC = () => {
    const { startImpersonation, isImpersonating, user: actingUser, authUser } = useAuth();
    const [users, setUsers] = useState<SystemUser[]>([]);
    const { data, loading: usersLoading, error: usersError } = useQuery(SYSTEM_USERS_QUERY, {
        fetchPolicy: 'network-only',
    });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteOrg, setInviteOrg] = useState('Universal Fleets');
    const [inviteRole, setInviteRole] = useState<SystemRole>('ORG_ADMIN');
    const [impersonationLoadingId, setImpersonationLoadingId] = useState<string | null>(null);

    const canImpersonate = Boolean(authUser?.roles.includes(UserRole.SYSTEM_ADMIN));
    const impersonatedUserId = canImpersonate && isImpersonating ? actingUser?.id ?? null : null;
    const isLoadingUsers = usersLoading && users.length === 0;

    const organizations = useMemo(() => {
        const orgSet = new Set(users.map(user => user.organization));
        pendingInvites.forEach(invite => orgSet.add(invite.organization));
        return Array.from(orgSet).sort();
    }, [users]);

    useEffect(() => {
        if (organizations.length > 0 && !organizations.includes(inviteOrg)) {
            setInviteOrg(organizations[0]);
        }
    }, [organizations, inviteOrg]);

    const editingUser = useMemo(
        () => users.find(user => user.id === editingUserId) ?? null,
        [users, editingUserId]
    );

    const seatUsage = useMemo(() => {
        const totals = users.reduce<Record<string, number>>((acc, user) => {
            acc[user.organization] = (acc[user.organization] ?? 0) + user.seatsUsed;
            return acc;
        }, {});
        return Object.entries(totals)
            .map(([organization, seats]) => ({ organization, seats }))
            .filter(entry => entry.seats > 0)
            .sort((a, b) => b.seats - a.seats)
            .slice(0, 4);
    }, [users]);

    const totalSystemAdmins = users.filter(user => user.status === 'active' && user.roles.includes('SYSTEM_ADMIN')).length;
    const totalOrganizations = new Set(users.map(user => user.organization)).size;
    const totalUsers = users.filter(user => user.seatsUsed > 0).length;
    const activeSeats = users.reduce((acc, user) => acc + user.seatsUsed, 0);

    const handleRoleToggle = (role: SystemRole) => {
        if (!editingUser) return;
        setUsers(prev =>
            prev.map(user =>
                user.id === editingUser.id
                    ? {
                          ...user,
                          roles: user.roles.includes(role)
                              ? user.roles.filter(existing => existing !== role)
                              : [...user.roles, role].sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b)),
                      }
                    : user
            )
        );
    };

    useEffect(() => {
        if (usersError) {
            console.error('Failed to load system users', usersError);
        }
    }, [usersError]);

    useEffect(() => {
        setUsers(mapUsersFromQuery(data));
    }, [data]);

    const handleGroupToggle = (group: string) => {
        if (!editingUser) return;
        setUsers(prev =>
            prev.map(user =>
                user.id === editingUser.id
                    ? {
                          ...user,
                          groups: user.groups.includes(group)
                              ? user.groups.filter(existing => existing !== group)
                              : [...user.groups, group],
                      }
                    : user
            )
        );
    };

    const closeEditModal = () => setEditingUserId(null);

    const handleSendInvite = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setInviteModalOpen(false);
        setInviteEmail('');
    };

    const handleImpersonateUser = async (target: SystemUser) => {
        if (!canImpersonate) {
            return;
        }

        setImpersonationLoadingId(target.id);
        try {
            await startImpersonation({ userId: target.id, email: target.email });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to impersonate this user right now.';
            if (typeof window !== 'undefined') {
                window.alert(message);
            }
        } finally {
            setImpersonationLoadingId(current => (current === target.id ? null : current));
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">System Permissions</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage privileged access across every organization connected to the platform.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
                    >
                        <ShieldCheckIcon className="h-5 w-5" />
                        Invite Super Admin
                    </button>
                    <a
                        href="/system/organizations"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400"
                    >
                        <OfficeBuildingIcon className="h-5 w-5" />
                        Manage Organizations
                    </a>
                </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<ShieldCheckIcon className="h-5 w-5" />}
                    label="System Admins"
                    value={totalSystemAdmins.toString()}
                    trend="All elevated access"
                />
                <StatCard
                    icon={<OfficeBuildingIcon className="h-5 w-5" />}
                    label="Organizations"
                    value={totalOrganizations.toString()}
                    trend="Connected tenants"
                />
                <StatCard
                    icon={<UserGroupIcon className="h-5 w-5" />}
                    label="Active Privileged Users"
                    value={totalUsers.toString()}
                    trend={`${pendingInvites.length} pending invitations`}
                />
                <StatCard
                    icon={<ChartBarIcon className="h-5 w-5" />}
                    label="Active Seats"
                    value={activeSeats.toString()}
                    trend="Across all organizations"
                />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Invitations</h2>
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                            {pendingInvites.length} awaiting
                        </span>
                    </div>
                    <div className="mt-4 space-y-4">
                        {pendingInvites.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 px-4 py-3 dark:border-gray-700">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{invite.email}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {invite.organization} • {roleLabels[invite.role]}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Sent {invite.sentAt}</p>
                                    <button className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
                                        Resend link
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pendingInvites.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">All invitations have been accepted.</p>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seat Utilization</h2>
                        <AdjustmentsIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Monitor how many licenses privileged users consume in each organization.
                    </p>
                    <div className="mt-6 space-y-4">
                        {seatUsage.map(entry => (
                            <div key={entry.organization}>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>{entry.organization}</span>
                                    <span>{entry.seats} seats</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className="h-full rounded-full bg-primary-500"
                                        style={{ width: `${Math.min((entry.seats / (activeSeats || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {seatUsage.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No seat usage recorded yet.</p>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <SystemUserTable
                    users={users}
                    isLoading={isLoadingUsers}
                    organizations={organizations}
                    roleLabels={roleLabels}
                    canImpersonate={canImpersonate}
                    impersonatedUserId={impersonatedUserId}
                    impersonationLoadingId={impersonationLoadingId}
                    onManageUser={setEditingUserId}
                    onImpersonateUser={handleImpersonateUser}
                    roleOrder={roleOrder}
                    totalAccounts={users.length}
                />
            </section>

            <Modal
                isOpen={Boolean(editingUser)}
                onClose={closeEditModal}
                title={editingUser ? `Manage access • ${editingUser.name}` : 'Manage access'}
            >
                {editingUser && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Roles</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Grant only the permissions required for this administrator.
                            </p>
                            <div className="mt-3 space-y-2">
                                {roleOrder.map(role => (
                                    <label key={role} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm dark:border-gray-700">
                                        <div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{roleLabels[role]}</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {role === 'SYSTEM_ADMIN' && 'Full control over all tenants and settings.'}
                                                {role === 'ORG_ADMIN' && 'Manage users, courses, and billing within an organization.'}
                                                {role === 'COURSE_COORDINATOR' && 'Curate catalog, assign learning paths, monitor progress.'}
                                                {role === 'TECHNICAL_STAFF' && 'Support learners, review requests, handle escalations.'}
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={editingUser.roles.includes(role)}
                                            onChange={() => handleRoleToggle(role)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Access groups</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Stack groups to reflect fine grained responsibilities.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {groupOptions.map(group => {
                                    const isActive = editingUser.groups.includes(group);
                                    return (
                                        <button
                                            key={group}
                                            onClick={() => handleGroupToggle(group)}
                                            className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                                                isActive
                                                    ? 'bg-primary-600 text-white shadow'
                                                    : 'border border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-500 dark:border-gray-600 dark:text-gray-300'
                                            }`}
                                            type="button"
                                        >
                                            {group}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            <div className="flex items-center justify-between">
                                <span>Current status</span>
                                <span className={`rounded-full px-3 py-1 font-medium ${statusStyles[editingUser.status]}`}>
                                    {editingUser.status === 'invited' ? 'Invitation sent' : editingUser.status.charAt(0).toUpperCase() + editingUser.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Last activity</span>
                                <span>{editingUser.lastActive}</span>
                            </div>
                        </div>

                        <div className="-mx-6 -mb-6 flex justify-end gap-3 rounded-b-lg bg-gray-50 px-6 py-4 dark:bg-gray-800">
                            <button
                                onClick={closeEditModal}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300"
                            >
                                Close
                            </button>
                            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
                                Save changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite new privileged user">
                <form onSubmit={handleSendInvite} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-email">
                            Work email
                        </label>
                        <input
                            id="invite-email"
                            type="email"
                            required
                            value={inviteEmail}
                            onChange={event => setInviteEmail(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-org">
                                Organization
                            </label>
                            <select
                                id="invite-org"
                                value={inviteOrg}
                                onChange={event => setInviteOrg(event.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                            >
                                {organizations.map(organization => (
                                    <option key={organization} value={organization}>
                                        {organization}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-role">
                                Role
                            </label>
                            <select
                                id="invite-role"
                                value={inviteRole}
                                onChange={event => setInviteRole(event.target.value as SystemRole)}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                            >
                                {roleOrder.map(role => (
                                    <option key={role} value={role}>
                                        {roleLabels[role]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-message">
                            Message
                        </label>
                        <textarea
                            id="invite-message"
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                            placeholder="Share context on why they are receiving elevated access."
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setInviteModalOpen(false)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                        >
                            Send invitation
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; trend: string }> = ({ icon, label, value, trend }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                {icon}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{trend}</span>
        </div>
        <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

export default SystemPermissionsScreen;
