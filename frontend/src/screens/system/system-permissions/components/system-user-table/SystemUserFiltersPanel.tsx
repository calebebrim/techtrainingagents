import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiltersState, SystemRole, UserStatus } from '../../types';

interface SystemUserFiltersPanelProps {
  filters: FiltersState;
  organizations: string[];
  roleOrder: SystemRole[];
  roleLabels: Record<SystemRole, string>;
  allStatuses: UserStatus[];
  seatFilterLabelMap: Record<FiltersState['seats'], string>;
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  onResetFilters: () => void;
}

const SystemUserFiltersPanel: React.FC<SystemUserFiltersPanelProps> = ({
  filters,
  organizations,
  roleOrder,
  roleLabels,
  allStatuses,
  seatFilterLabelMap,
  onFilterChange,
  onResetFilters
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 lg:grid-cols-5">
      <input
        value={filters.name}
        onChange={(event) => onFilterChange('name', event.target.value)}
        placeholder={t('systemPermissions.directory.filters.namePlaceholder')}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
      <select
        value={filters.organization}
        onChange={(event) => onFilterChange('organization', event.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="all">{t('systemPermissions.directory.filters.organizationAll')}</option>
        {organizations.map((organization) => (
          <option key={organization} value={organization}>
            {organization}
          </option>
        ))}
      </select>
      <select
        value={filters.role}
        onChange={(event) => onFilterChange('role', event.target.value as FiltersState['role'])}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="all">{t('systemPermissions.directory.filters.roleAll')}</option>
        {roleOrder.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(event) => onFilterChange('status', event.target.value as FiltersState['status'])}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="all">{t('systemPermissions.directory.filters.statusAll')}</option>
        {allStatuses.map((status) => (
          <option key={status} value={status}>
            {t('systemPermissions.statuses.' + status, {
              defaultValue: status.charAt(0).toUpperCase() + status.slice(1)
            })}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <select
          value={filters.seats}
          onChange={(event) => onFilterChange('seats', event.target.value as FiltersState['seats'])}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">{seatFilterLabelMap.all}</option>
          <option value="occupied">{seatFilterLabelMap.occupied}</option>
          <option value="available">{seatFilterLabelMap.available}</option>
        </select>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          {t('systemPermissions.directory.filters.reset')}
        </button>
      </div>
    </div>
  );
};

export default SystemUserFiltersPanel;
