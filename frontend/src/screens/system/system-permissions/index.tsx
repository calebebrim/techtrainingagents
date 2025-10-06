import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { UserRole } from '../../../types';
import SystemPermissionsHeader from './components/SystemPermissionsHeader';
import StatsSection from './components/StatsSection';
import InvitationsCard from './components/InvitationsCard';
import SeatUsageCard from './components/SeatUsageCard';
import SystemUserTable from './components/SystemUserTable';
import ManageUserModal from './components/ManageUserModal';
import InviteModal from './components/InviteModal';
import { useSystemUsers } from './hooks/useSystemUsers';
import { DEFAULT_INVITE_ORG, DEFAULT_INVITE_ROLE, pendingInvites } from './constants';
import { SystemRole, SystemUser, roleLabels, roleOrder } from './types';

const SystemPermissionsScreen: React.FC = () => {
  const { startImpersonation, isImpersonating, user: actingUser, authUser } = useAuth();
  const { t } = useTranslation();
  const {
    users,
    setUsers,
    userOrganizations,
    seatUsage,
    stats,
    loading,
    error
  } = useSystemUsers();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOrg, setInviteOrg] = useState(DEFAULT_INVITE_ORG);
  const [inviteRole, setInviteRole] = useState<SystemRole>(DEFAULT_INVITE_ROLE);
  const [impersonationLoadingId, setImpersonationLoadingId] = useState<string | null>(null);

  const canImpersonate = Boolean(authUser?.roles.includes(UserRole.SYSTEM_ADMIN));
  const impersonatedUserId = canImpersonate && isImpersonating ? actingUser?.id ?? null : null;
  const isLoadingUsers = loading && users.length === 0;

  const organizations = useMemo(() => {
    const orgSet = new Set(userOrganizations);
    pendingInvites.forEach((invite) => orgSet.add(invite.organization));
    return Array.from(orgSet).sort();
  }, [userOrganizations]);

  const localizedRoleLabels = useMemo(
    () =>
      roleOrder.reduce<Record<SystemRole, string>>((acc, role) => {
        acc[role] = t(`systemPermissions.roles.${role}`, { defaultValue: roleLabels[role] });
        return acc;
      }, { ...roleLabels }),
    [t]
  );

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingUserId) ?? null,
    [users, editingUserId]
  );

  useEffect(() => {
    if (organizations.length > 0 && !organizations.includes(inviteOrg)) {
      setInviteOrg(organizations[0]);
    }
  }, [organizations, inviteOrg]);

  useEffect(() => {
    if (error) {
      console.error('Failed to load system users', error);
    }
  }, [error]);

  const handleRoleToggle = (role: SystemRole) => {
    if (!editingUser) {
      return;
    }
    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              roles: user.roles.includes(role)
                ? user.roles.filter((existing) => existing !== role)
                : [...user.roles, role].sort(
                    (a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b)
                  )
            }
          : user
      )
    );
  };

  const handleGroupToggle = (group: string) => {
    if (!editingUser) {
      return;
    }
    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              groups: user.groups.includes(group)
                ? user.groups.filter((existing) => existing !== group)
                : [...user.groups, group]
            }
          : user
      )
    );
  };

  const closeEditModal = () => setEditingUserId(null);

  const handleSendInvite = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleImpersonateUser = async (target: SystemUser) => {
    if (!canImpersonate) {
      return;
    }

    setImpersonationLoadingId(target.id);
    try {
      await startImpersonation({ userId: target.id, email: target.email });
    } catch (impersonationError) {
      const message =
        impersonationError instanceof Error
          ? impersonationError.message
          : t('systemPermissions.impersonation.error');
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    } finally {
      setImpersonationLoadingId((current) => (current === target.id ? null : current));
    }
  };

  return (
    <div className="space-y-10">
      <SystemPermissionsHeader onOpenInviteModal={() => setInviteModalOpen(true)} />

      <StatsSection
        totalSystemAdmins={stats.totalSystemAdmins}
        totalOrganizations={stats.totalOrganizations}
        totalUsers={stats.totalUsers}
        activeSeats={stats.activeSeats}
        pendingInvitesCount={pendingInvites.length}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <InvitationsCard invites={pendingInvites} />
        <SeatUsageCard seatUsage={seatUsage} activeSeats={stats.activeSeats} />
      </section>

      <section className="space-y-4">
        <SystemUserTable
          users={users}
          isLoading={isLoadingUsers}
          organizations={organizations}
          roleLabels={localizedRoleLabels}
          canImpersonate={canImpersonate}
          impersonatedUserId={impersonatedUserId}
          impersonationLoadingId={impersonationLoadingId}
          onManageUser={setEditingUserId}
          onImpersonateUser={handleImpersonateUser}
          roleOrder={roleOrder}
          totalAccounts={users.length}
        />
      </section>

      <ManageUserModal
        user={editingUser}
        localizedRoleLabels={localizedRoleLabels}
        onClose={closeEditModal}
        onToggleRole={handleRoleToggle}
        onToggleGroup={handleGroupToggle}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSubmit={handleSendInvite}
        email={inviteEmail}
        organization={inviteOrg}
        role={inviteRole}
        onEmailChange={setInviteEmail}
        onOrganizationChange={setInviteOrg}
        onRoleChange={setInviteRole}
        organizations={organizations.length > 0 ? organizations : [DEFAULT_INVITE_ORG]}
        roleOrder={roleOrder}
        localizedRoleLabels={localizedRoleLabels}
      />
    </div>
  );
};

export default SystemPermissionsScreen;
