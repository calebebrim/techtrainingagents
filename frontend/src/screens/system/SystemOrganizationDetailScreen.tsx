import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
    OfficeBuildingIcon,
    UserGroupIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    ChevronRightIcon,
} from '../../components/icons';
import { roleLabels } from './systemPermissionsTypes';

const SYSTEM_ORGANIZATION_QUERY = gql`
    query SystemOrganization($id: ID!) {
        organization(id: $id) {
            id
            name
            plan
            cnpj
            domain
            description
            dashboard {
                totalEmployees
                activeCourses
                averageScore
            }
            users {
                id
                name
                email
                roles
                status
            }
            courses {
                id
                title
                status
                averageScore
                completionRate
            }
        }
    }
`;

interface SystemOrganizationDetailData {
    organization: {
        id: string;
        name: string;
        plan?: string | null;
        cnpj?: string | null;
        domain?: string | null;
        description?: string | null;
        dashboard?: {
            totalEmployees?: number | null;
            activeCourses?: number | null;
            averageScore?: number | null;
        } | null;
        users?: Array<{
            id: string;
            roles?: string[] | null;
            status?: string | null;
        }> | null;
        courses?: Array<{
            id: string;
            title: string;
            status: string;
            averageScore?: number | null;
            completionRate?: number | null;
        }> | null;
    } | null;
}

const toTitleCase = (value?: string | null) => {
    if (!value) return '—';
    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
        .join(' ');
};

const SystemOrganizationDetailScreen: React.FC = () => {
    const navigate = useNavigate();
    const { organizationId } = useParams<{ organizationId: string }>();

    const { data, loading, error } = useQuery<SystemOrganizationDetailData>(SYSTEM_ORGANIZATION_QUERY, {
        skip: !organizationId,
        variables: { id: organizationId ?? '' },
        fetchPolicy: 'network-only',
    });

    const organization = data?.organization ?? null;

    const metrics = useMemo(() => {
        if (!organization) {
            return {
                totalEmployees: 0,
                privilegedSeats: 0,
                activeCourses: 0,
                averageScore: null as number | null,
            };
        }

        const users = organization.users ?? [];
        const totalEmployees = organization.dashboard?.totalEmployees ?? users.length;
        const privilegedSeats = users.filter(user => {
            const roles = user.roles ?? [];
            return roles.some(role => ['ORG_ADMIN', 'SYSTEM_ADMIN', 'COURSE_COORDINATOR'].includes(role));
        }).length;

        const activeCourses = organization.dashboard?.activeCourses ?? organization.courses?.length ?? 0;
        const averageScore = organization.dashboard?.averageScore ?? null;

        return {
            totalEmployees,
            privilegedSeats,
            activeCourses,
            averageScore,
        };
    }, [organization]);

    const isInitialLoading = loading && !organization;

    return (
        <div className="space-y-10">
            {isInitialLoading && (
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    Loading tenant insights…
                </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/system/organizations')}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-500"
                    >
                        ← Back to organizations
                    </button>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{organization?.name ?? 'Organization'}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {organization?.description || 'Investigate tenant health, adoption, and privileged access.'}
                    </p>
                </div>
                {organization && (
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                            Plan: <strong className="ml-1 text-gray-900 dark:text-gray-200">{toTitleCase(organization.plan)}</strong>
                        </span>
                        <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                            Domain: <strong className="ml-1 text-gray-900 dark:text-gray-200">{organization.domain || '—'}</strong>
                        </span>
                        <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                            CNPJ: <strong className="ml-1 text-gray-900 dark:text-gray-200">{organization.cnpj || '—'}</strong>
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                    Unable to load the latest snapshot. Showing cached data when possible.
                </div>
            )}

            {!loading && !organization && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    This organization could not be found. It may have been removed or you no longer have access.
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    icon={<OfficeBuildingIcon className="h-5 w-5" />}
                    label="Employees"
                    value={metrics.totalEmployees.toLocaleString()}
                    description="Total active learner accounts"
                />
                <MetricCard
                    icon={<ShieldCheckIcon className="h-5 w-5" />}
                    label="Privileged seats"
                    value={metrics.privilegedSeats.toString()}
                    description="Org admins and elevated roles"
                />
                <MetricCard
                    icon={<ChartBarIcon className="h-5 w-5" />}
                    label="Active courses"
                    value={metrics.activeCourses.toString()}
                    description="Published learning modules"
                />
                <MetricCard
                    icon={<UserGroupIcon className="h-5 w-5" />}
                    label="Avg. score"
                    value={typeof metrics.averageScore === 'number' ? `${Math.round(metrics.averageScore)}%` : '—'}
                    description="Latest performance index"
                />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent courses</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Snapshot of published courses and completion trends.</p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">Course</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Avg. score</th>
                                    <th className="px-4 py-3 text-right">Completion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {loading && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Loading course insights…
                                        </td>
                                    </tr>
                                )}
                                {!loading && organization?.courses?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No courses have been published yet.
                                        </td>
                                    </tr>
                                )}
                                {!loading && (organization?.courses ?? []).slice(0, 6).map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{course.title}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">ID: {course.id.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            {toTitleCase(course.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                            {typeof course.averageScore === 'number' ? `${Math.round(course.averageScore)}%` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                            {typeof course.completionRate === 'number' ? `${Math.round(course.completionRate * 100)}%` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Privileged roles overview</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Understand how elevated access is distributed.</p>
                    <div className="mt-4 space-y-3">
                        {['SYSTEM_ADMIN', 'ORG_ADMIN', 'COURSE_COORDINATOR'].map(role => {
                            const usersWithRole = organization?.users?.filter(user => (user.roles ?? []).includes(role)) ?? [];
                            const statusCounts = usersWithRole.reduce<Record<string, number>>((acc, user) => {
                                const key = (user.status ?? 'UNKNOWN').toUpperCase();
                                acc[key] = (acc[key] ?? 0) + 1;
                                return acc;
                            }, {});

                            return (
                                <div key={role} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{roleLabels[role as keyof typeof roleLabels]}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                            {usersWithRole.length} members
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        {Object.entries(statusCounts).map(([status, count]) => (
                                            <span key={status} className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700/60">
                                                {status}: {count}
                                            </span>
                                        ))}
                                        {usersWithRole.length === 0 && (
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-400 dark:bg-gray-700/60 dark:text-gray-500">
                                                No members assigned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string; description: string }> = ({ icon, label, value, description }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                {icon}
            </span>
            <ChevronRightIcon className="h-4 w-4 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{description}</p>
    </div>
);

export default SystemOrganizationDetailScreen;
