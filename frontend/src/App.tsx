
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import LoginScreen from './screens/LoginScreen';
import OrgHomeScreen from './screens/organization/OrgHomeScreen';
import SearchScreen from './screens/organization/SearchScreen';
import UserCoursesScreen from './screens/organization/UserCoursesScreen';
import UserLearningPathsScreen from './screens/organization/UserLearningPathsScreen';
import UserCertificatesScreen from './screens/organization/UserCertificatesScreen';
import MgmtHomeScreen from './screens/management/MgmtHomeScreen';
import MgmtCourseScoresScreen from './screens/management/MgmtCourseScoresScreen';
import MgmtEmployeeScoresScreen from './screens/management/MgmtEmployeeScoresScreen';
import MgmtPermissionsScreen from './screens/management/MgmtPermissionsScreen';
import SystemOrganizationsScreen from './screens/system/SystemOrganizationsScreen';
import SystemPermissionsScreen from './screens/system/SystemPermissionsScreen';
import AccountSettingsScreen from './screens/AccountSettingsScreen';
import { ApolloProvider } from '@apollo/client/react';
import client from './apollo';
import { UserRole } from './types';

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    const isSystemAdmin = user?.roles.includes(UserRole.SYSTEM_ADMIN) ?? false;
    const hasOrganizationAccess = !isSystemAdmin;
    const hasManagementAccess = hasOrganizationAccess && user?.roles.some(role => [UserRole.ORG_ADMIN, UserRole.COURSE_COORDINATOR].includes(role));
    const hasSystemAccess = isSystemAdmin;
    const defaultPath = isSystemAdmin ? '/system/organizations' : '/';

    const guard = (allowed: boolean, element: React.ReactElement) =>
        allowed ? element : <Navigate to={defaultPath} replace />;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-600 dark:text-gray-300">
                Loading your workspace...
            </div>
        );
    }

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/health" element={<div>I'm alive!</div>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={guard(hasOrganizationAccess, <OrgHomeScreen />)} />
                <Route path="/search" element={guard(hasOrganizationAccess, <SearchScreen />)} />
                <Route path="/my-courses" element={guard(hasOrganizationAccess, <UserCoursesScreen />)} />
                <Route path="/my-paths" element={guard(hasOrganizationAccess, <UserLearningPathsScreen />)} />
                <Route path="/my-certificates" element={guard(hasOrganizationAccess, <UserCertificatesScreen />)} />

                <Route path="/manage" element={guard(hasManagementAccess, <MgmtHomeScreen />)} />
                <Route path="/manage/course-scores" element={guard(hasManagementAccess, <MgmtCourseScoresScreen />)} />
                <Route path="/manage/employee-scores" element={guard(hasManagementAccess, <MgmtEmployeeScoresScreen />)} />
                <Route path="/manage/permissions" element={guard(hasManagementAccess, <MgmtPermissionsScreen />)} />

                <Route path="/system/organizations" element={guard(hasSystemAccess, <SystemOrganizationsScreen />)} />
                <Route path="/system/permissions" element={guard(hasSystemAccess, <SystemPermissionsScreen />)} />

                <Route path="/account-settings" element={<AccountSettingsScreen />} />

                <Route path="*" element={<Navigate to={defaultPath} replace />} />
            </Routes>
        </MainLayout>
    );
}

const App: React.FC = () => {
    return (
        <ApolloProvider client={client}>
            <ThemeProvider>
                <AuthProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ApolloProvider>
    );
};

export default App;
