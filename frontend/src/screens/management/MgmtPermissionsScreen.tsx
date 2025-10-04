import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { UserRole, User, UserGroup } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ORGANIZATION_GROUPS_QUERY, ORGANIZATION_USERS_QUERY } from '../../graphql/queries';

interface GroupsQueryData {
    groups: Array<{
        id: string;
        name: string;
        description: string | null;
        isSystem: boolean;
    }>;
}

interface UsersQueryData {
    users: Array<{
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
        roles: string[];
        groups?: Array<{ id: string }>;
    }>;
}

const MgmtPermissionsScreen: React.FC = () => {
    const { user } = useAuth();
    const organizationId = user?.organizationId;

    const {
        data: groupsData,
        loading: groupsLoading,
        error: groupsError,
    } = useQuery<GroupsQueryData>(ORGANIZATION_GROUPS_QUERY, {
        variables: { organizationId: organizationId ?? '' },
        skip: !organizationId,
    });

    const {
        data: usersData,
        loading: usersLoading,
        error: usersError,
    } = useQuery<UsersQueryData>(ORGANIZATION_USERS_QUERY, {
        variables: { organizationId: organizationId ?? '' },
        skip: !organizationId,
    });

    const groups: UserGroup[] = useMemo(() => {
        if (!groupsData?.groups) {
            return [];
        }
        return groupsData.groups.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description ?? '',
        }));
    }, [groupsData]);

    const validRoles = useMemo(() => Object.values(UserRole) as string[], []);

    const users: User[] = useMemo(() => {
        if (!usersData?.users) {
            return [];
        }
        return usersData.users.map((entry) => ({
            id: entry.id,
            name: entry.name,
            email: entry.email,
            avatarUrl: entry.avatarUrl ?? undefined,
            roles: entry.roles.filter((role): role is UserRole => validRoles.includes(role)),
            organizationId: organizationId ?? '',
            groups: entry.groups?.map((group) => group.id) ?? [],
        }));
    }, [usersData, validRoles, organizationId]);

    if (!organizationId) {
        return (
            <div className="container mx-auto space-y-8">
                <h1 className="text-3xl font-bold">User Permissions</h1>
                <p className="text-gray-600 dark:text-gray-400">Select an organization to manage permissions.</p>
            </div>
        );
    }

    if (groupsLoading || usersLoading) {
        return (
            <div className="container mx-auto space-y-8">
                <h1 className="text-3xl font-bold">User Permissions</h1>
                <p className="text-gray-600 dark:text-gray-400">Loading permissions data...</p>
            </div>
        );
    }

    if (groupsError || usersError) {
        const message = groupsError?.message ?? usersError?.message ?? 'Unknown error';
        return (
            <div className="container mx-auto space-y-8">
                <h1 className="text-3xl font-bold">User Permissions</h1>
                <p className="text-red-600">Failed to load permissions: {message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-3xl font-bold">User Permissions</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Groups</h2>
                             <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                                Create New
                            </button>
                        </div>
                        <div className="space-y-3">
                            {groups.map(group => (
                                <div key={group.id} className="p-4 border dark:border-gray-700 rounded-lg">
                                    <h3 className="font-semibold">{group.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.description || 'No description provided.'}</p>
                                </div>
                            ))}
                            {groups.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No groups available.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold p-6">Users</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Groups</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b dark:border-gray-700">
                                            <td className="px-6 py-4 flex items-center">
                                                 {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                                                 ) : (
                                                    <div className="w-8 h-8 rounded-full mr-3 bg-primary-600 text-white flex items-center justify-center uppercase text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                 )}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                {user.groups?.map(groupId => {
                                                    const group = groups.find(g => g.id === groupId);
                                                    return (
                                                        <span key={groupId} className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                                                            {group?.name ?? 'Unknown'}
                                                        </span>
                                                    );
                                                })}
                                                {(!user.groups || user.groups.length === 0) && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">No groups</span>
                                                )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found for this organization.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MgmtPermissionsScreen;
