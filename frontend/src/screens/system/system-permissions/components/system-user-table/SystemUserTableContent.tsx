import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SystemRole,
  SystemUser,
  UserStatus,
  statusStyles
} from '../../types';

interface SystemUserTableContentProps {
  users: SystemUser[];
  isLoading: boolean;
  roleLabels: Record<SystemRole, string>;
  canImpersonate: boolean;
  impersonatedUserId: string | null;
  impersonationLoadingId: string | null;
  onManageUser: (userId: string) => void;
  onImpersonateUser: (user: SystemUser) => void;
}

const SystemUserTableContent: React.FC<SystemUserTableContentProps> = ({
  users,
  isLoading,
  roleLabels,
  canImpersonate,
  impersonatedUserId,
  impersonationLoadingId,
  onManageUser,
  onImpersonateUser
}) => {
  const { t } = useTranslation();

  const translatedGroupLabels = useMemo(
    () => ({
      'System Maintainers': t('systemPermissions.manageModal.groups.options.maintainers', {
        defaultValue: 'System Maintainers'
      }),
      'Org Owners': t('systemPermissions.manageModal.groups.options.owners', {
        defaultValue: 'Org Owners'
      }),
      'Security Reviewers': t('systemPermissions.manageModal.groups.options.reviewers', {
        defaultValue: 'Security Reviewers'
      }),
      'Compliance Review': t('systemPermissions.manageModal.groups.options.compliance', {
        defaultValue: 'Compliance Review'
      }),
      Readonly: t('systemPermissions.manageModal.groups.options.readonly', {
        defaultValue: 'Readonly'
      })
    }),
    [t]
  );

  const formatGroupList = (groups: string[]) => {
    const mapped = groups.map((group) => translatedGroupLabels[group] ?? group);
    return mapped.filter(Boolean).join(', ');
  };

  const renderStatusPill = (status: UserStatus) => (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
      {t('systemPermissions.statuses.' + status, {
        defaultValue: status.charAt(0).toUpperCase() + status.slice(1)
      })}
    </span>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">
              {t('systemPermissions.directory.columns.user')}
            </th>
            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">
              {t('systemPermissions.directory.columns.organization')}
            </th>
            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">
              {t('systemPermissions.directory.columns.roles')}
            </th>
            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">
              {t('systemPermissions.directory.columns.status')}
            </th>
            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">
              {t('systemPermissions.directory.columns.lastActive')}
            </th>
            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">
              {t('systemPermissions.directory.columns.seats')}
            </th>
            <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-300">
              {t('systemPermissions.directory.columns.actions')}
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
          {!isLoading && users.length > 0 &&
            users.map((user) => {
              const isCurrentTarget = impersonatedUserId === user.id;
              const isLoadingTarget = impersonationLoadingId === user.id;
              const impersonationLabel = isCurrentTarget
                ? t('systemPermissions.impersonation.current', { defaultValue: 'Currently impersonating' })
                : impersonatedUserId
                ? t('systemPermissions.impersonation.switch', { defaultValue: 'Switch to this user' })
                : t('systemPermissions.impersonation.impersonate', { defaultValue: 'Impersonate user' });

              return (
                <tr key={user.id} className="bg-white dark:bg-gray-900">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                      <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {t('systemPermissions.directory.groupsLabel')}: {formatGroupList(user.groups) || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.organization}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role) => (
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
                          {isLoadingTarget
                            ? t('systemPermissions.impersonation.switching')
                            : impersonationLabel}
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
          {!isLoading && users.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                {t('systemPermissions.directory.empty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SystemUserTableContent;
