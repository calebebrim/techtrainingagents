import React from 'react';
import { useTranslation } from 'react-i18next';

interface SystemUserTableHeaderProps {
  hasResults: boolean;
  showingLabel: string;
  rangeLabel: string;
  statusSummary: string;
  roleSummary: string;
  seatSummary: string;
}

const SystemUserTableHeader: React.FC<SystemUserTableHeaderProps> = ({
  hasResults,
  showingLabel,
  rangeLabel,
  statusSummary,
  roleSummary,
  seatSummary
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('systemPermissions.directory.title')}
        </h2>
        {hasResults && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {showingLabel} • {rangeLabel}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        <span>{statusSummary}</span>
        <span>{roleSummary}</span>
        <span>{seatSummary}</span>
      </div>
    </div>
  );
};

export default SystemUserTableHeader;
