import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
    <div className="flex items-center justify-between">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
        {icon}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{trend}</span>
    </div>
    <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

export default StatCard;
