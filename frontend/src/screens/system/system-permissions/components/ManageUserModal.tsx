import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../../components/common/Modal';
import { groupOptions } from '../constants';
import { SystemRole, SystemUser, roleOrder, statusStyles } from '../types';

interface ManageUserModalProps {
  user: SystemUser | null;
  localizedRoleLabels: Record<SystemRole, string>;
  onClose: () => void;
  onToggleRole: (role: SystemRole) => void;
  onToggleGroup: (group: string) => void;
}

const ManageUserModal: React.FC<ManageUserModalProps> = ({
  user,
  localizedRoleLabels,
  onClose,
  onToggleRole,
  onToggleGroup
}) => {
  const { t } = useTranslation();

  const translatedGroupLabels = useMemo(
    () => ({
      'System Maintainers': t('systemPermissions.manageModal.groups.options.maintainers', {
        defaultValue: 'System Maintainers'
      }),
      'Org Owners': t('systemPermissions.manageModal.groups.options.owners', { defaultValue: 'Org Owners' }),
      'Security Reviewers': t('systemPermissions.manageModal.groups.options.reviewers', {
        defaultValue: 'Security Reviewers'
      }),
      'Compliance Review': t('systemPermissions.manageModal.groups.options.compliance', {
        defaultValue: 'Compliance Review'
      }),
      Readonly: t('systemPermissions.manageModal.groups.options.readonly', { defaultValue: 'Readonly' })
    }),
    [t]
  );

  return (
    <Modal
      isOpen={Boolean(user)}
      onClose={onClose}
      title={user ? t('systemPermissions.manageModal.titleWithName', { name: user.name }) : t('systemPermissions.manageModal.title')}
    >
      {user && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('systemPermissions.manageModal.roles.title')}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('systemPermissions.manageModal.roles.description')}
            </p>
            <div className="mt-3 space-y-2">
              {roleOrder.map((role) => (
                <label
                  key={role}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 text-sm dark:border-gray-700"
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{localizedRoleLabels[role]}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {role === 'SYSTEM_ADMIN' && t('systemPermissions.manageModal.roles.SYSTEM_ADMIN')}
                      {role === 'ORG_ADMIN' && t('systemPermissions.manageModal.roles.ORG_ADMIN')}
                      {role === 'COURSE_COORDINATOR' && t('systemPermissions.manageModal.roles.COURSE_COORDINATOR')}
                      {role === 'TECHNICAL_STAFF' && t('systemPermissions.manageModal.roles.TECHNICAL_STAFF')}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={user.roles.includes(role)}
                    onChange={() => onToggleRole(role)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('systemPermissions.manageModal.groups.title')}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('systemPermissions.manageModal.groups.description')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {groupOptions.map((group) => {
                const isActive = user.groups.includes(group);
                return (
                  <button
                    key={group}
                    onClick={() => onToggleGroup(group)}
                    className={`rounded-full px-4 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'bg-primary-600 text-white shadow'
                        : 'border border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-500 dark:border-gray-600 dark:text-gray-300'
                    }`}
                    type="button"
                  >
                    {translatedGroupLabels[group] ?? group}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>{t('systemPermissions.manageModal.status')}</span>
              <span className={`rounded-full px-3 py-1 font-medium ${statusStyles[user.status]}`}>
                {t(`systemPermissions.statuses.${user.status}`, {
                  defaultValue: user.status.charAt(0).toUpperCase() + user.status.slice(1)
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('systemPermissions.manageModal.lastActive')}</span>
              <span>{user.lastActive}</span>
            </div>
          </div>

          <div className="-mx-6 -mb-6 flex justify-end gap-3 rounded-b-lg bg-gray-50 px-6 py-4 dark:bg-gray-800">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300"
            >
              {t('systemPermissions.manageModal.close')}
            </button>
            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">
              {t('systemPermissions.manageModal.save')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ManageUserModal;
