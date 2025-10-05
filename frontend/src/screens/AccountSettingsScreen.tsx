
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { LANGUAGE_OPTIONS, SupportedLanguage, useLanguage } from '../contexts/LanguageContext';
import { getInitials } from '../utils/avatar';
import { useTranslation } from 'react-i18next';

const AccountSettingsScreen: React.FC = () => {
    const { user } = useAuth();
    const { language, setLanguage } = useLanguage();
    const { showNotification } = useNotifications();
    const { t } = useTranslation();

    if (!user) return null;

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLanguage = event.target.value as SupportedLanguage;
        if (nextLanguage === language) {
            return;
        }
        setLanguage(nextLanguage);
        showNotification({ message: t('accountSettings.languageUpdated'), type: 'success' });
    };

    return (
        <div className="container mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">{t('accountSettings.title')}</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                <div className="flex items-center space-x-4">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="User avatar" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-semibold uppercase" aria-hidden="true">
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-semibold">{user.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>

                <form className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('accountSettings.fullName')}</label>
                        <input type="text" id="name" defaultValue={user.name} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('accountSettings.email')}</label>
                        <input type="email" id="email" defaultValue={user.email} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('accountSettings.systemLanguage')}</label>
                        <select
                            id="language"
                            value={language}
                            onChange={handleLanguageChange}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            {LANGUAGE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {t('accountSettings.languageHelper')}
                        </p>
                    </div>
                     <div className="pt-4">
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            {t('accountSettings.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettingsScreen;
