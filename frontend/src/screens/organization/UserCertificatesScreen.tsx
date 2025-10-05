
import React from 'react';
import { useTranslation } from 'react-i18next';

const UserCertificatesScreen: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('navigation.organization.certificates.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('navigation.organization.certificates.description')}</p>
            {/* Certificate list component would go here */}
        </div>
    );
};

export default UserCertificatesScreen;
