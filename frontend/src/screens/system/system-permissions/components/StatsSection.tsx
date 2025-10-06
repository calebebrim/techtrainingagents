import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon, OfficeBuildingIcon, UserGroupIcon, ChartBarIcon } from '../../../../components/icons';
import StatCard from './StatCard';

interface StatsSectionProps {
  totalSystemAdmins: number;
  totalOrganizations: number;
  totalUsers: number;
  activeSeats: number;
  pendingInvitesCount: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  totalSystemAdmins,
  totalOrganizations,
  totalUsers,
  activeSeats,
  pendingInvitesCount
}) => {
  const { t } = useTranslation();

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<ShieldCheckIcon className="h-5 w-5" />}
        label={t('systemPermissions.stats.systemAdmins.label')}
        value={totalSystemAdmins.toString()}
        trend={t('systemPermissions.stats.systemAdmins.trend')}
      />
      <StatCard
        icon={<OfficeBuildingIcon className="h-5 w-5" />}
        label={t('systemPermissions.stats.organizations.label')}
        value={totalOrganizations.toString()}
        trend={t('systemPermissions.stats.organizations.trend')}
      />
      <StatCard
        icon={<UserGroupIcon className="h-5 w-5" />}
        label={t('systemPermissions.stats.privilegedUsers.label')}
        value={totalUsers.toString()}
        trend={t('systemPermissions.stats.privilegedUsers.trend', { count: pendingInvitesCount })}
      />
      <StatCard
        icon={<ChartBarIcon className="h-5 w-5" />}
        label={t('systemPermissions.stats.activeSeats.label')}
        value={activeSeats.toString()}
        trend={t('systemPermissions.stats.activeSeats.trend')}
      />
    </section>
  );
};

export default StatsSection;
