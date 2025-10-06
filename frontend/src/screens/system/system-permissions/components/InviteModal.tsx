import React from 'react';
import Modal from '../../../../components/common/Modal';
import { useTranslation } from 'react-i18next';
import { SystemRole } from '../types';

interface InviteModalProps {
  isOpen: boolean;
  email: string;
  organization: string;
  role: SystemRole;
  organizations: string[];
  roleOrder: SystemRole[];
  localizedRoleLabels: Record<SystemRole, string>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onEmailChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onRoleChange: (role: SystemRole) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  email,
  organization,
  role,
  organizations,
  roleOrder,
  localizedRoleLabels,
  onClose,
  onSubmit,
  onEmailChange,
  onOrganizationChange,
  onRoleChange
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('systemPermissions.inviteModal.title')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-email">
            {t('systemPermissions.inviteModal.emailLabel')}
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-org">
              {t('systemPermissions.inviteModal.organizationLabel')}
            </label>
            <select
              id="invite-org"
              value={organization}
              onChange={(event) => onOrganizationChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {organizations.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-role">
              {t('systemPermissions.inviteModal.roleLabel')}
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(event) => onRoleChange(event.target.value as SystemRole)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {roleOrder.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {localizedRoleLabels[roleOption]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="invite-message">
            {t('systemPermissions.inviteModal.messageLabel')}
          </label>
          <textarea
            id="invite-message"
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder={t('systemPermissions.inviteModal.messagePlaceholder')}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300"
          >
            {t('systemPermissions.inviteModal.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            {t('systemPermissions.inviteModal.submit')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteModal;
