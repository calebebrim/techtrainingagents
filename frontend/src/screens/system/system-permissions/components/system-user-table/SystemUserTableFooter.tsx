import React from 'react';
import { useTranslation } from 'react-i18next';

interface SystemUserTableFooterProps {
  page: number;
  totalPages: number;
  onPageChange: (direction: 'prev' | 'next') => void;
  pageLabel: string;
  resultsLabel: string;
}

const SystemUserTableFooter: React.FC<SystemUserTableFooterProps> = ({
  page,
  totalPages,
  onPageChange,
  pageLabel,
  resultsLabel
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <span>{pageLabel}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange('prev')}
          disabled={page <= 1}
          className={`rounded-lg border px-3 py-1 transition ${
            page <= 1
              ? 'cursor-not-allowed border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600'
              : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300'
          }`}
        >
          {t('systemPermissions.directory.pagination.prev')}
        </button>
        <button
          onClick={() => onPageChange('next')}
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
      <span>{resultsLabel}</span>
    </div>
  );
};

export default SystemUserTableFooter;
