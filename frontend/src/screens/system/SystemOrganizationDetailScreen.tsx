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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    const { data, loading, error } = useQuery<SystemOrganizationDetailData>(SYSTEM_ORGANIZATION_QUERY, {
        skip: !organizationId,
        variables: { id: organizationId ?? '' },
        fetchPolicy: 'network-only',
    });

    const organization = data?.organization ?? null;

    const planLabel = useMemo(() => {
        if (!organization?.plan) {
            return '—';
        }
        const key = organization.plan.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return t(`systemOrganizations.plan.${key}`, { defaultValue: toTitleCase(organization.plan) });
    }, [organization?.plan, t]);

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

    const formatStatusLabel = (status: string) => {
        const normalized = status.toLowerCase();
        return t(`systemOrganizationDetail.statuses.${normalized}`, { defaultValue: toTitleCase(status) });
    };

    const formatCourseStatus = (status: string) => {
        const normalized = status.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        return t(`systemOrganizationDetail.courseStatus.${normalized}`, { defaultValue: toTitleCase(status) });
    };

    return (
        <div className="space-y-10">
            {isInitialLoading && (
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {t('systemOrganizationDetail.loading')}
                </div>
            )}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/system/organizations')}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-500"
                    >
                        ← {t('systemOrganizationDetail.back')}
                    </button>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{organization?.name ?? t('systemOrganizationDetail.defaultTitle')}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {organization?.description || t('systemOrganizationDetail.defaultDescription')}
                    </p>
                </div>
                {organization && (
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                            {t('systemOrganizationDetail.badges.plan')}: <strong className="ml-1 text-gray-900 dark:text-gray-200">{planLabel}</strong>
                        </span>
                        <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                            {t('systemOrganizationDetail.badges.domain')}: <strong className="ml-1 text-gray-900 dark:text-gray-200">{organization.domain || '—'}</strong>
                        </span>
                        <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
                            {t('systemOrganizationDetail.badges.cnpj')}: <strong className="ml-1 text-gray-900 dark:text-gray-200">{organization.cnpj || '—'}</strong>
                        </span>
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                    {t('systemOrganizationDetail.notices.snapshotError')}
                </div>
            )}

            {!loading && !organization && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    {t('systemOrganizationDetail.notices.missing')}
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    icon={<OfficeBuildingIcon className="h-5 w-5" />}
                    label={t('systemOrganizationDetail.metrics.employees.label')}
                    value={metrics.totalEmployees.toLocaleString()}
                    description={t('systemOrganizationDetail.metrics.employees.description')}
                />
                <MetricCard
                    icon={<ShieldCheckIcon className="h-5 w-5" />}
                    label={t('systemOrganizationDetail.metrics.privileged.label')}
                    value={metrics.privilegedSeats.toString()}
                    description={t('systemOrganizationDetail.metrics.privileged.description')}
                />
                <MetricCard
                    icon={<ChartBarIcon className="h-5 w-5" />}
                    label={t('systemOrganizationDetail.metrics.courses.label')}
                    value={metrics.activeCourses.toString()}
                    description={t('systemOrganizationDetail.metrics.courses.description')}
                />
                <MetricCard
                    icon={<UserGroupIcon className="h-5 w-5" />}
                    label={t('systemOrganizationDetail.metrics.averageScore.label')}
                    value={typeof metrics.averageScore === 'number' ? `${Math.round(metrics.averageScore)}%` : '—'}
                    description={t('systemOrganizationDetail.metrics.averageScore.description')}
                />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('systemOrganizationDetail.courses.title')}</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('systemOrganizationDetail.courses.description')}</p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">{t('systemOrganizationDetail.courses.columns.course')}</th>
                                    <th className="px-4 py-3">{t('systemOrganizationDetail.courses.columns.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('systemOrganizationDetail.courses.columns.avgScore')}</th>
                                    <th className="px-4 py-3 text-right">{t('systemOrganizationDetail.courses.columns.completion')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {loading && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {t('systemOrganizationDetail.courses.loading')}
                                        </td>
                                    </tr>
                                )}
                                {!loading && organization?.courses?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {t('systemOrganizationDetail.courses.empty')}
                                        </td>
                                    </tr>
                                )}
                                {!loading && (organization?.courses ?? []).slice(0, 6).map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{course.title}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">{t('systemOrganizationDetail.courses.idLabel', { value: course.id.slice(0, 8) })}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            {formatCourseStatus(course.status)}
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('systemOrganizationDetail.privilegedRoles.title')}</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('systemOrganizationDetail.privilegedRoles.description')}</p>
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
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t(`systemPermissions.roles.${role}`, { defaultValue: roleLabels[role as keyof typeof roleLabels] })}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                            {t('systemOrganizationDetail.privilegedRoles.members', { count: usersWithRole.length })}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        {Object.entries(statusCounts).map(([status, count]) => (
                                            <span key={status} className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700/60">
                                                {t('systemOrganizationDetail.privilegedRoles.statusChip', {
                                                    status: formatStatusLabel(status),
                                                    count,
                                                })}
                                            </span>
                                        ))}
                                        {usersWithRole.length === 0 && (
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-400 dark:bg-gray-700/60 dark:text-gray-500">
                                                {t('systemOrganizationDetail.privilegedRoles.none')}
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
