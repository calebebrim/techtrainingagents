
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { HomeIcon, SearchIcon, BookOpenIcon, AcademicCapIcon, ShieldCheckIcon, AdjustmentsIcon, OfficeBuildingIcon, UserGroupIcon, ChartBarIcon } from '../icons';
import { useTranslation } from 'react-i18next';

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg ${
                isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`
        }
    >
        {icon}
        <span className="ml-3">{label}</span>
    </NavLink>
);

const Sidebar: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const isSystemAdmin = user?.roles.includes(UserRole.SYSTEM_ADMIN) ?? false;
    const hasOrganizationAccess = !isSystemAdmin;
    const hasMgmtAccess = hasOrganizationAccess && user?.roles.some(role => [UserRole.ORG_ADMIN, UserRole.COURSE_COORDINATOR].includes(role));
    const hasSystemAccess = isSystemAdmin;

    return (
        <aside className={`flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Platfy</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {hasOrganizationAccess && (
                    <>
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('navigation.sections.organization')}</p>
                        <NavItem to="/" icon={<HomeIcon className="w-5 h-5" />} label={t('navigation.items.home')} />
                        <NavItem to="/search" icon={<SearchIcon className="w-5 h-5" />} label={t('navigation.items.search')} />
                        <NavItem to="/my-courses" icon={<BookOpenIcon className="w-5 h-5" />} label={t('navigation.items.myCourses')} />
                        <NavItem to="/my-paths" icon={<AdjustmentsIcon className="w-5 h-5" />} label={t('navigation.items.learningPaths')} />
                        <NavItem to="/my-certificates" icon={<AcademicCapIcon className="w-5 h-5" />} label={t('navigation.items.certificates')} />

                        {hasMgmtAccess && (
                            <>
                                <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('navigation.sections.management')}</p>
                                <NavItem to="/manage" icon={<ChartBarIcon className="w-5 h-5" />} label={t('navigation.items.dashboard')} />
                                <NavItem to="/manage/course-scores" icon={<BookOpenIcon className="w-5 h-5" />} label={t('navigation.items.courseScores')} />
                                <NavItem to="/manage/employee-scores" icon={<UserGroupIcon className="w-5 h-5" />} label={t('navigation.items.employeeScores')} />
                                <NavItem to="/manage/permissions" icon={<ShieldCheckIcon className="w-5 h-5" />} label={t('navigation.items.permissions')} />
                            </>
                        )}
                    </>
                )}

                {hasSystemAccess && (
                    <>
                        <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('navigation.sections.system')}</p>
                        <NavItem to="/system/organizations" icon={<OfficeBuildingIcon className="w-5 h-5" />} label={t('navigation.items.organizations')} />
                        <NavItem to="/system/permissions" icon={<ShieldCheckIcon className="w-5 h-5" />} label={t('navigation.items.systemPermissions')} />
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
