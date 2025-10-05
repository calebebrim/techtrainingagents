import React, { useEffect, useMemo, useState } from 'react';
import {
    SystemRole,
    SystemUserTableProps,
    UserStatus,
    defaultFilters,
    FiltersState,
    PAGE_SIZE,
    statusStyles,
} from '../systemPermissionsTypes';
import { useTranslation } from 'react-i18next';
const allStatuses: UserStatus[] = ['active', 'inactive', 'suspended', 'invited'];

const SystemUserTable: React.FC<SystemUserTableProps> = ({
    users,
    isLoading,
    organizations,
    roleLabels,
    canImpersonate,
    impersonatedUserId,
    impersonationLoadingId,
    onManageUser,
    onImpersonateUser,
    roleOrder,
    totalAccounts,
}) => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState(defaultFilters);
    const [page, setPage] = useState(1);

    const translatedGroupLabels = useMemo(() => ({
        'System Maintainers': t('systemPermissions.manageModal.groups.options.maintainers', { defaultValue: 'System Maintainers' }),
        'Org Owners': t('systemPermissions.manageModal.groups.options.owners', { defaultValue: 'Org Owners' }),
        'Security Reviewers': t('systemPermissions.manageModal.groups.options.reviewers', { defaultValue: 'Security Reviewers' }),
        'Compliance Review': t('systemPermissions.manageModal.groups.options.compliance', { defaultValue: 'Compliance Review' }),
        'Readonly': t('systemPermissions.manageModal.groups.options.readonly', { defaultValue: 'Readonly' }),
    }), [t]);

    const formatGroupList = (groups: string[]) => {
        const mapped = groups.map(group => translatedGroupLabels[group] ?? group);
        return mapped.filter(Boolean).join(', ');
    };

    const renderStatusPill = (status: UserStatus) => (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
            {t(`systemPermissions.statuses.${status}`, {
                defaultValue: status.charAt(0).toUpperCase() + status.slice(1),
            })}
        </span>
    );

    const handleFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    useEffect(() => {
        setPage(1);
    }, [filters, users]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const nameMatch = filters.name.trim().length === 0
                || `${user.name} ${user.email}`.toLowerCase().includes(filters.name.trim().toLowerCase());
            const organizationMatch = filters.organization === 'all' || user.organization === filters.organization;
            const roleMatch = filters.role === 'all' || user.roles.includes(filters.role);
            const statusMatch = filters.status === 'all' || user.status === filters.status;
            const seatMatch =
                filters.seats === 'all'
                    ? true
                    : filters.seats === 'occupied'
                        ? user.seatsUsed > 0
                        : user.seatsUsed === 0;

            return nameMatch && organizationMatch && roleMatch && statusMatch && seatMatch;
        });
    }, [users, filters]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedUsers = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, page]);

    const handlePageChange = (direction: 'prev' | 'next') => {
        setPage(current => {
            if (direction === 'prev') {
                return current > 1 ? current - 1 : current;
            }
            return current < totalPages ? current + 1 : current;
        });
    };

    const showingLabel = t('systemPermissions.directory.showing', { shown: filteredUsers.length, total: totalAccounts });
    const rangeStart = filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const rangeEnd = filteredUsers.length === 0 ? 0 : Math.min(page * PAGE_SIZE, filteredUsers.length);
    const rangeLabel = filteredUsers.length === 0
        ? t('systemPermissions.directory.pagination.zero')
        : t('systemPermissions.directory.pagination.range', { start: rangeStart, end: rangeEnd });
    const pageLabel = t('systemPermissions.directory.pagination.page', { page, pages: totalPages });
    const resultsLabel = t('systemPermissions.directory.pagination.results', { count: filteredUsers.length });

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('systemPermissions.directory.title')}</h2>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {showingLabel}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <button
                        type="button"
                        onClick={() => handlePageChange('prev')}
                        disabled={page === 1}
                        className={`rounded-lg border px-3 py-1 transition ${
                            page === 1
                                ? 'cursor-not-allowed border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600'
                                : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300'
                        }`}
                    >
                        {t('systemPermissions.directory.pagination.prev')}
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {rangeLabel}
                    </span>
                    <button
                        type="button"
                        onClick={() => handlePageChange('next')}
                        disabled={page >= totalPages}
                        className={`rounded-lg border px-3 py-1 transition ${
                            page >= totalPages
                                ? 'cursor-not-allowed border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600'
                                : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300'
                        }`}
                    >
                        {t('systemPermissions.directory.pagination.next')}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">{t('systemPermissions.directory.columns.user')}</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">{t('systemPermissions.directory.columns.organization')}</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">{t('systemPermissions.directory.columns.roles')}</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">{t('systemPermissions.directory.columns.status')}</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">{t('systemPermissions.directory.columns.lastActive')}</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">{t('systemPermissions.directory.columns.seats')}</th>
                            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">{t('systemPermissions.directory.columns.actions')}</th>
                        </tr>
                        <tr className="bg-white dark:bg-gray-900">
                            <th className="px-6 pb-4">
                                <input
                                    value={filters.name}
                                    onChange={event => handleFilterChange('name', event.target.value)}
                                    placeholder={t('systemPermissions.directory.filters.namePlaceholder')}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </th>
                            <th className="px-6 pb-4 pt-3">
                                <select
                                    value={filters.organization}
                                    onChange={event => handleFilterChange('organization', event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="all">{t('systemPermissions.directory.filters.organizationAll')}</option>
                                    {organizations.map(organization => (
                                        <option key={organization} value={organization}>
                                            {organization}
                                        </option>
                                    ))}
                                </select>
                            </th>
                            <th className="px-6 pb-4 pt-3">
                                <select
                                    value={filters.role}
                                    onChange={event => handleFilterChange('role', event.target.value as SystemRole | 'all')}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="all">{t('systemPermissions.directory.filters.roleAll')}</option>
                                    {roleOrder.map(role => (
                                    <option key={role} value={role}>
                                            {roleLabels[role]}
                                        </option>
                                    ))}
                                </select>
                            </th>
                            <th className="px-6 pb-4 pt-3">
                                <select
                                    value={filters.status}
                                    onChange={event => handleFilterChange('status', event.target.value as UserStatus | 'all')}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="all">{t('systemPermissions.directory.filters.statusAll')}</option>
                                    {allStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {t(`systemPermissions.statuses.${status}`, {
                                                defaultValue: status.charAt(0).toUpperCase() + status.slice(1),
                                            })}
                                        </option>
                                    ))}
                                </select>
                            </th>
                            <th className="px-6 pb-4 pt-3">
                                <input
                                    value=""
                                    disabled
                                    placeholder="—"
                                    className="w-full cursor-not-allowed rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                                />
                            </th>
                            <th className="px-6 pb-4 pt-3">
                                <select
                                    value={filters.seats}
                                    onChange={event => handleFilterChange('seats', event.target.value as FiltersState['seats'])}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="all">{t('systemPermissions.directory.filters.seatsAll')}</option>
                                    <option value="occupied">{t('systemPermissions.directory.filters.seatsOccupied')}</option>
                                    <option value="available">{t('systemPermissions.directory.filters.seatsAvailable')}</option>
                                </select>
                            </th>
                            <th className="px-6 pb-4 pt-3 text-right">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFilters(defaultFilters);
                                        setPage(1);
                                    }}
                                    className="text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                                >
                                    {t('systemPermissions.directory.filters.reset')}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t('systemPermissions.directory.loading')}
                                </td>
                            </tr>
                        )}
                        {!isLoading && pagedUsers.map(user => {
                            const isCurrentTarget = impersonatedUserId === user.id;
                            const isLoadingTarget = impersonationLoadingId === user.id;
                            const impersonationLabel = isCurrentTarget
                                ? t('systemPermissions.impersonation.current')
                                : impersonatedUserId
                                    ? t('systemPermissions.impersonation.switch')
                                    : t('systemPermissions.impersonation.impersonate');

                            return (
                                <tr key={user.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                                            <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('systemPermissions.directory.groupsLabel')}: {formatGroupList(user.groups) || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.organization}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.map(role => (
                                                <span
                                                    key={role}
                                                    className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                                                >
                                                    {roleLabels[role]}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{renderStatusPill(user.status)}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.lastActive}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.seatsUsed}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => onManageUser(user.id)}
                                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-300"
                                            >
                                                {t('systemPermissions.impersonation.manage')}
                                            </button>
                                            {canImpersonate && (
                                                <button
                                                    onClick={() => onImpersonateUser(user)}
                                                    disabled={isCurrentTarget || isLoadingTarget}
                                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                                        isCurrentTarget
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'
                                                            : 'border border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-500/40 dark:text-primary-300 dark:hover:bg-primary-500/10'
                                                    } ${isLoadingTarget ? 'cursor-not-allowed opacity-70' : ''}`}
                                                >
                                                    {isLoadingTarget ? t('systemPermissions.impersonation.switching') : impersonationLabel}
                                                </button>
                                            )}
                                            {isCurrentTarget && (
                                                <span className="text-xs font-medium text-amber-600 dark:text-amber-300">
                                                    {t('systemPermissions.impersonation.sessionActive')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!isLoading && pagedUsers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t('systemPermissions.directory.empty')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500">
                <span>{pageLabel}</span>
                <span>{resultsLabel}</span>
            </div>
        </div>
    );
};

export default SystemUserTable;
