import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon, OfficeBuildingIcon } from '../../../../components/icons';

interface SystemPermissionsHeaderProps {
  onOpenInviteModal: () => void;
}

const SystemPermissionsHeader: React.FC<SystemPermissionsHeaderProps> = ({ onOpenInviteModal }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{t('systemPermissions.title')}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('systemPermissions.description')}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onOpenInviteModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
        >
          <ShieldCheckIcon className="h-5 w-5" />
          {t('systemPermissions.actions.invite')}
        </button>
        <a
          href="/system/organizations"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400"
        >
          <OfficeBuildingIcon className="h-5 w-5" />
          {t('systemPermissions.actions.manageOrganizations')}
        </a>
      </div>
    </div>
  );
};

export default SystemPermissionsHeader;
