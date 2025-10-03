
import React from 'react';
import { UserRole, User, UserGroup } from '../../types';

const mockGroups: UserGroup[] = [
    {id: 'g1', name: UserRole.ADMIN, description: 'Full access to organization management.'},
    {id: 'g2', name: UserRole.COURSE_COORDINATOR, description: 'Can create and manage courses.'},
    {id: 'g3', name: UserRole.TECHNICAL_STAFF, description: 'Standard employee access to courses.'},
];

const mockUsers: User[] = [
    { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', avatarUrl: 'https://picsum.photos/seed/u1/100/100', roles: [UserRole.ADMIN], organizationId: 'o1', groups: ['g1', 'g3'] },
    { id: 'u2', name: 'Bob Johnson', email: 'bob@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100/100', roles: [UserRole.COURSE_COORDINATOR], organizationId: 'o1', groups: ['g2'] },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100/100', roles: [UserRole.TECHNICAL_STAFF], organizationId: 'o1', groups: ['g3'] },
];

const MgmtPermissionsScreen: React.FC = () => {
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
                            {mockGroups.map(group => (
                                <div key={group.id} className="p-4 border dark:border-gray-700 rounded-lg">
                                    <h3 className="font-semibold">{group.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.description}</p>
                                </div>
                            ))}
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
                                    {mockUsers.map(user => (
                                        <tr key={user.id} className="border-b dark:border-gray-700">
                                            <td className="px-6 py-4 flex items-center">
                                                 <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                {user.groups?.map(groupId => (
                                                    <span key={groupId} className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                                                        {mockGroups.find(g => g.id === groupId)?.name}
                                                    </span>
                                                ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
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