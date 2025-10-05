import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpenIcon, AdjustmentsIcon, AcademicCapIcon, ChevronRightIcon } from '../../components/icons';
import { Link } from 'react-router-dom';
import { USER_ENROLLMENTS_QUERY } from '../../graphql/queries';
import { useTranslation } from 'react-i18next';

interface UserEnrollmentsQueryData {
    enrollments: Array<{
        id: string;
        status: string;
        progress: number;
        score: number | null;
        course?: {
            id: string;
            title: string;
        };
    }>;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-500 dark:text-primary-300 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const QuickLink: React.FC<{ to: string; title: string; description: string; }> = ({ to, title, description }) => (
    <Link to={to} className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400"/>
        </div>
    </Link>
);


const OrgHomeScreen: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const { t } = useTranslation();

    const { data, loading, error } = useQuery<UserEnrollmentsQueryData>(
        USER_ENROLLMENTS_QUERY,
        {
            variables: { userId: userId ?? '' },
            skip: !userId,
        }
    );

    const enrollments = (data?.enrollments ?? []) as UserEnrollmentsQueryData['enrollments'];

    const formatStatus = (status?: string) => {
        if (!status) return '—';
        const key = status.toLowerCase();
        return t(`navigation.organization.home.statuses.${key}`, {
            defaultValue: status
                .toLowerCase()
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
        });
    };

    const coursesInProgress = useMemo(() => (
        enrollments.filter((enrollment) => {
            if (enrollment.status === 'COMPLETED') {
                return false;
            }
            return (enrollment.progress ?? 0) < 1;
        }).length
    ), [enrollments]);

    const certificatesEarned = useMemo(() => (
        enrollments.filter((enrollment) => enrollment.status === 'COMPLETED').length
    ), [enrollments]);

    const learningPaths = user?.groups?.length ?? 0;

    const continueLearning = useMemo(() => {
        const inProgress = enrollments
            .filter((enrollment) => enrollment.status !== 'COMPLETED')
            .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
        return inProgress.slice(0, 3);
    }, [enrollments]);

    return (
        <div className="container mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">{t('navigation.organization.home.welcome', { name: user?.name ?? '' })}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{t('navigation.organization.home.summary')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('navigation.organization.home.stats.courses')} value={userId ? coursesInProgress.toString() : '—'} icon={<BookOpenIcon className="w-6 h-6"/>} />
                <StatCard title={t('navigation.organization.home.stats.paths')} value={userId ? learningPaths.toString() : '—'} icon={<AdjustmentsIcon className="w-6 h-6"/>} />
                <StatCard title={t('navigation.organization.home.stats.certificates')} value={userId ? certificatesEarned.toString() : '—'} icon={<AcademicCapIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">{t('navigation.organization.home.continue.title')}</h2>
                    {!userId && <p className="text-sm text-gray-500 dark:text-gray-400">{t('navigation.organization.home.continue.signIn')}</p>}
                    {userId && loading && <p className="text-sm text-gray-500 dark:text-gray-400">{t('navigation.organization.home.continue.loading')}</p>}
                    {userId && error && <p className="text-sm text-red-600">{t('navigation.organization.home.continue.error', { message: error.message })}</p>}
                    {userId && !loading && !error && (
                        <div className="space-y-3">
                            {continueLearning.map((enrollment) => (
                                <div key={enrollment.id} className="p-3 border dark:border-gray-700 rounded-lg">
                                    <p className="font-medium">{enrollment.course?.title ?? t('navigation.organization.home.continue.untitledCourse')}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                        <div className="bg-primary-600 h-2.5 rounded-full" style={{width: `${Math.round((enrollment.progress ?? 0) * 100)}%`}}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {t('navigation.organization.home.continue.progress', {
                                            percent: Math.round((enrollment.progress ?? 0) * 100),
                                            status: formatStatus(enrollment.status),
                                        })}
                                    </p>
                                </div>
                            ))}
                            {continueLearning.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('navigation.organization.home.continue.empty')}</p>
                            )}
                        </div>
                    )}
                </div>

                 <div className="space-y-6">
                    <h2 className="text-xl font-semibold">{t('navigation.organization.home.quickLinks.title')}</h2>
                    <div className="space-y-4">
                        <QuickLink to="/my-courses" title={t('navigation.organization.home.quickLinks.myCourses.title')} description={t('navigation.organization.home.quickLinks.myCourses.description')} />
                        <QuickLink to="/my-paths" title={t('navigation.organization.home.quickLinks.learningPaths.title')} description={t('navigation.organization.home.quickLinks.learningPaths.description')} />
                        <QuickLink to="/search" title={t('navigation.organization.home.quickLinks.explore.title')} description={t('navigation.organization.home.quickLinks.explore.description')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgHomeScreen;
