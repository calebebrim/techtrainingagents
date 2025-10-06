import React from 'react';
import { useTranslation } from 'react-i18next';
import { Invite } from '../types';

interface InvitationsCardProps {
  invites: Invite[];
}

const InvitationsCard: React.FC<InvitationsCardProps> = ({ invites }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('systemPermissions.invitations.title')}
        </h2>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {t('systemPermissions.invitations.badge', { count: invites.length })}
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between rounded-xl border border-dashed border-gray-300 px-4 py-3 dark:border-gray-700"
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{invite.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {invite.organization} • {t(`systemPermissions.roles.${invite.role}`, { defaultValue: invite.role })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {t('systemPermissions.invitations.sentAt', { time: invite.sentAt })}
              </p>
              <button className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
                {t('systemPermissions.invitations.resend')}
              </button>
            </div>
          </div>
        ))}
        {invites.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('systemPermissions.invitations.empty')}
          </p>
        )}
      </div>
    </div>
  );
};

export default InvitationsCard;
