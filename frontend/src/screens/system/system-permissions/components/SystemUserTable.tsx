import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiltersState,
  PAGE_SIZE,
  SystemRole,
  SystemUserTableProps,
  UserStatus,
  defaultFilters
} from '../types';
import SystemUserTableHeader from './system-user-table/SystemUserTableHeader';
import SystemUserFiltersPanel from './system-user-table/SystemUserFiltersPanel';
import SystemUserTableContent from './system-user-table/SystemUserTableContent';
import SystemUserTableFooter from './system-user-table/SystemUserTableFooter';

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
  totalAccounts
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);

  const handleFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [filters, users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const nameMatch =
        filters.name.trim().length === 0 ||
        `${user.name} ${user.email}`.toLowerCase().includes(filters.name.trim().toLowerCase());
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
    setPage((current) => {
      if (direction === 'prev') {
        return current > 1 ? current - 1 : current;
      }
      return current < totalPages ? current + 1 : current;
    });
  };

  const showingLabel = t('systemPermissions.directory.showing', {
    shown: filteredUsers.length,
    total: totalAccounts
  });
  const rangeStart = filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = filteredUsers.length === 0 ? 0 : Math.min(page * PAGE_SIZE, filteredUsers.length);
  const rangeLabel =
    filteredUsers.length === 0
      ? t('systemPermissions.directory.pagination.zero')
      : t('systemPermissions.directory.pagination.range', { start: rangeStart, end: rangeEnd });
  const pageLabel = t('systemPermissions.directory.pagination.page', { page, pages: totalPages });
  const resultsLabel = t('systemPermissions.directory.pagination.results', { count: filteredUsers.length });

  const statusColumnLabel = t('systemPermissions.directory.columns.status', { defaultValue: 'Status' });
  const roleColumnLabel = t('systemPermissions.directory.columns.roles', { defaultValue: 'Roles' });
  const seatsColumnLabel = t('systemPermissions.directory.columns.seats', { defaultValue: 'Seats' });

  const seatFilterLabelMap: Record<FiltersState['seats'], string> = useMemo(
    () => ({
      all: t('systemPermissions.directory.filters.seatsAll', { defaultValue: 'All' }),
      occupied: t('systemPermissions.directory.filters.seatsOccupied', { defaultValue: 'With seat' }),
      available: t('systemPermissions.directory.filters.seatsAvailable', { defaultValue: 'No seat' })
    }),
    [t]
  );

  const statusFilterValue =
    filters.status === 'all'
      ? t('systemPermissions.directory.filters.statusAll', { defaultValue: 'All' })
      : t('systemPermissions.statuses.' + filters.status, {
          defaultValue: filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
        });

  const roleFilterValue =
    filters.role === 'all'
      ? t('systemPermissions.directory.filters.roleAll', { defaultValue: 'All' })
      : roleLabels[filters.role];

  const seatFilterValue = seatFilterLabelMap[filters.seats];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <SystemUserTableHeader
        hasResults={filteredUsers.length > 0}
        showingLabel={showingLabel}
        rangeLabel={rangeLabel}
        statusSummary={`${statusColumnLabel}: ${statusFilterValue}`}
        roleSummary={`${roleColumnLabel}: ${roleFilterValue}`}
        seatSummary={`${seatsColumnLabel}: ${seatFilterValue}`}
      />

      <SystemUserFiltersPanel
        filters={filters}
        organizations={organizations}
        roleOrder={roleOrder}
        roleLabels={roleLabels}
        allStatuses={allStatuses}
        seatFilterLabelMap={seatFilterLabelMap}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <SystemUserTableContent
        users={pagedUsers}
        isLoading={isLoading}
        roleLabels={roleLabels}
        canImpersonate={canImpersonate}
        impersonatedUserId={impersonatedUserId}
        impersonationLoadingId={impersonationLoadingId}
        onManageUser={onManageUser}
        onImpersonateUser={onImpersonateUser}
      />

      <SystemUserTableFooter
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageLabel={pageLabel}
        resultsLabel={resultsLabel}
      />
    </div>
  );
};

export default SystemUserTable;
