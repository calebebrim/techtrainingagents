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
import { ApolloProvider } from '@apollo/client';
import client from './apollo';

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<OrgHomeScreen />} />
                <Route path="/search" element={<SearchScreen />} />
                <Route path="/my-courses" element={<UserCoursesScreen />} />
                <Route path="/my-paths" element={<UserLearningPathsScreen />} />
                <Route path="/my-certificates" element={<UserCertificatesScreen />} />
                
                <Route path="/manage" element={<MgmtHomeScreen />} />
                <Route path="/manage/course-scores" element={<MgmtCourseScoresScreen />} />
                <Route path="/manage/employee-scores" element={<MgmtEmployeeScoresScreen />} />
                <Route path="/manage/permissions" element={<MgmtPermissionsScreen />} />

                <Route path="/system/organizations" element={<SystemOrganizationsScreen />} />
                <Route path="/system/permissions" element={<SystemPermissionsScreen />} />

                <Route path="/account-settings" element={<AccountSettingsScreen />} />

                <Route path="*" element={<Navigate to="/" replace />} />
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
