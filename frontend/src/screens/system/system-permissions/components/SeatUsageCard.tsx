import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdjustmentsIcon } from '../../../../components/icons';
import { SeatUsage } from '../types';

interface SeatUsageCardProps {
  seatUsage: SeatUsage;
  activeSeats: number;
}

const SeatUsageCard: React.FC<SeatUsageCardProps> = ({ seatUsage, activeSeats }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('systemPermissions.seatUsage.title')}
        </h2>
        <AdjustmentsIcon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t('systemPermissions.seatUsage.description')}
      </p>
      <div className="mt-6 space-y-4">
        {seatUsage.map((entry) => (
          <div key={entry.organization}>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>{entry.organization}</span>
              <span>{t('systemPermissions.seatUsage.count', { count: entry.seats })}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${Math.min((entry.seats / (activeSeats || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
        {seatUsage.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('systemPermissions.seatUsage.empty')}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatUsageCard;
