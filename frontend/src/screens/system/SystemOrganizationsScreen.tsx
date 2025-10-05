import React, { useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { OfficeBuildingIcon, UserGroupIcon, ChartBarIcon, ShieldCheckIcon, ChevronRightIcon } from '../../components/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SystemOrgUser {
    id: string;
    status?: string | null;
    roles?: string[] | null;
}

interface SystemOrgDashboard {
    totalEmployees?: number | null;
    activeCourses?: number | null;
    averageScore?: number | null;
}

interface SystemOrganization {
    id: string;
    name: string;
    plan?: string | null;
    cnpj?: string | null;
    domain?: string | null;
    users?: SystemOrgUser[] | null;
    dashboard?: SystemOrgDashboard | null;
}

interface SystemOrganizationsData {
    organizations: SystemOrganization[];
}

const SYSTEM_ORGANIZATIONS_QUERY = gql`
    query SystemOrganizations {
        organizations {
            id
            name
            plan
            cnpj
            domain
            dashboard {
                totalEmployees
                activeCourses
                averageScore
            }
            users {
                id
                status
                roles
            }
        }
    }
`;

const capitalize = (value: string | null | undefined) => {
    if (!value) {
        return '—';
    }
    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
};

const SystemOrganizationsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { data, loading, error } = useQuery<SystemOrganizationsData>(SYSTEM_ORGANIZATIONS_QUERY, {
        fetchPolicy: 'network-only',
    });

    const preparedOrganizations = useMemo(() => {
        const list = data?.organizations ?? [];
        return list
            .map(org => {
                const users = org.users ?? [];
                const activeUsers = users.filter(user => (user.status ?? '').toUpperCase() === 'ACTIVE');
                const adminSeats = users.filter(user => {
                    const roles = user.roles ?? [];
                    return roles.some(role => ['ORG_ADMIN', 'SYSTEM_ADMIN', 'COURSE_COORDINATOR'].includes(role));
                });
                const totalEmployees = org.dashboard?.totalEmployees ?? users.length;
                const activeCourses = org.dashboard?.activeCourses ?? 0;
                const averageScore = org.dashboard?.averageScore ?? null;
                const planKey = (org.plan ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const planLabel = org.plan ? t(`systemOrganizations.plan.${planKey}`, { defaultValue: capitalize(org.plan) }) : '—';

                return {
                    id: org.id,
                    name: org.name,
                    planLabel,
                    cnpj: org.cnpj ?? '—',
                    domain: org.domain ?? '—',
                    totalEmployees,
                    activeUsers: activeUsers.length,
                    adminSeats: adminSeats.length,
                    activeCourses,
                    averageScore,
                };
            })
            .sort((a, b) => b.totalEmployees - a.totalEmployees);
    }, [data, t]);

    const totals = useMemo(() => {
        if (preparedOrganizations.length === 0) {
            return {
                organizations: 0,
                employees: 0,
                admins: 0,
                activeCourses: 0,
                avgScore: null as number | null,
            };
        }

        const organizations = preparedOrganizations.length;
        const employees = preparedOrganizations.reduce((acc, org) => acc + org.totalEmployees, 0);
        const admins = preparedOrganizations.reduce((acc, org) => acc + org.adminSeats, 0);
        const activeCourses = preparedOrganizations.reduce((acc, org) => acc + org.activeCourses, 0);

        const scoreEntries = preparedOrganizations
            .map(org => org.averageScore)
            .filter((value): value is number => typeof value === 'number');
        const avgScore = scoreEntries.length > 0
            ? scoreEntries.reduce((acc, value) => acc + value, 0) / scoreEntries.length
            : null;

        return {
            organizations,
            employees,
            admins,
            activeCourses,
            avgScore,
        };
    }, [preparedOrganizations]);

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{t('systemOrganizations.title')}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {t('systemOrganizations.description')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/system/permissions"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400"
                    >
                        <ShieldCheckIcon className="h-5 w-5" />
                        {t('systemOrganizations.actions.managePermissions')}
                    </a>
                    <button
                        type="button"
                        onClick={() => navigate('/system/organizations/register')}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                    >
                        <OfficeBuildingIcon className="h-5 w-5" />
                        {t('systemOrganizations.actions.register')}
                    </button>
                </div>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={<OfficeBuildingIcon className="h-5 w-5" />}
                    label={t('systemOrganizations.stats.organizations.label')}
                    value={totals.organizations.toString()}
                    sublabel={t('systemOrganizations.stats.organizations.sublabel')}
                />
                <StatCard
                    icon={<UserGroupIcon className="h-5 w-5" />}
                    label={t('systemOrganizations.stats.employees.label')}
                    value={totals.employees.toLocaleString()}
                    sublabel={t('systemOrganizations.stats.employees.sublabel')}
                />
                <StatCard
                    icon={<ShieldCheckIcon className="h-5 w-5" />}
                    label={t('systemOrganizations.stats.privileged.label')}
                    value={totals.admins.toString()}
                    sublabel={t('systemOrganizations.stats.privileged.sublabel')}
                />
                <StatCard
                    icon={<ChartBarIcon className="h-5 w-5" />}
                    label={t('systemOrganizations.stats.courses.label')}
                    value={totals.activeCourses.toString()}
                    sublabel={t('systemOrganizations.stats.courses.sublabel')}
                />
            </section>

            {typeof totals.avgScore === 'number' && (
                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-primary-800 shadow-sm dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-200">
                    <p className="text-sm font-medium">{t('systemOrganizations.averageScore.title')}</p>
                    <p className="mt-1 text-3xl font-semibold">{Math.round(totals.avgScore)}%</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-primary-500 dark:text-primary-300">
                        {t('systemOrganizations.averageScore.source')}
                    </p>
                </div>
            )}

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('systemOrganizations.table.title')}</h2>
                    {error && (
                        <span className="text-sm text-rose-600 dark:text-rose-400">{t('systemOrganizations.table.error')}</span>
                    )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-300">{t('systemOrganizations.table.columns.organization')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-300">{t('systemOrganizations.table.columns.plan')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-300">{t('systemOrganizations.table.columns.employees')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-300">{t('systemOrganizations.table.columns.privileged')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-300">{t('systemOrganizations.table.columns.courses')}</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-300">{t('systemOrganizations.table.columns.score')}</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading && preparedOrganizations.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {t('systemOrganizations.table.loading')}
                                    </td>
                                </tr>
                            )}
                            {!loading && preparedOrganizations.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {t('systemOrganizations.table.empty')}
                                    </td>
                                </tr>
                            )}
                            {preparedOrganizations.map(org => (
                                <tr key={org.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{org.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{t('systemOrganizations.table.domain', { value: org.domain })}</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">{t('systemOrganizations.table.cnpj', { value: org.cnpj })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{org.planLabel}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{org.totalEmployees.toLocaleString()}</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">{t('systemOrganizations.table.activeUsers', { count: org.activeUsers, value: org.activeUsers.toLocaleString() })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{org.adminSeats}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{org.activeCourses}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {typeof org.averageScore === 'number' ? `${Math.round(org.averageScore)}%` : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/system/organizations/${org.id}`)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-300"
                                        >
                                            {t('systemOrganizations.actions.viewTenant')}
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sublabel: string }> = ({ icon, label, value, sublabel }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                {icon}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{sublabel}</span>
        </div>
        <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
);

export default SystemOrganizationsScreen;
