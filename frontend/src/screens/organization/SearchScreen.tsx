
import React from 'react';
import { SearchIcon } from '../../components/icons';
import { useTranslation } from 'react-i18next';

const SearchScreen: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('navigation.organization.search.title')}</h1>
            <div className="relative">
                <input
                    type="text"
                    placeholder={t('navigation.organization.search.placeholder')}
                    className="w-full p-4 pl-12 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="w-6 h-6 text-gray-400" />
                </div>
            </div>
            {/* Search results would be displayed here */}
        </div>
    );
};

export default SearchScreen;
