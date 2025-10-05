
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserCoursesScreen: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('navigation.organization.courses.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('navigation.organization.courses.description')}</p>
             {/* Course list component would go here */}
        </div>
    );
};

export default UserCoursesScreen;
