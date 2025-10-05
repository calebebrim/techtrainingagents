import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { SearchIcon } from '../../components/icons';
import { CourseStats } from '../../types';
import Modal from '../../components/common/Modal';
import TopicGraph from '../../components/common/TopicGraph';
import { ORGANIZATION_DASHBOARD_QUERY } from '../../graphql/queries';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface CourseStatsQueryData {
    organizationDashboard: {
        courseStats: Array<{
            averageScore: number | null;
            enrolledCount: number;
            completionRate: number;
            course: {
                id: string;
                title: string;
                topics?: Array<{
                    id: string;
                    name: string;
                    dependencies: string[];
                }>;
                employees?: Array<{
                    overallScore: number | null;
                    user: {
                        id: string;
                        name: string;
                    };
                }>;
            };
        }>;
    } | null;
}

const MgmtCourseScoresScreen: React.FC = () => {
    const { user } = useAuth();
    const organizationId = user?.organizationId;
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<CourseStats | null>(null);

    const { data, loading, error } = useQuery<CourseStatsQueryData>(
        ORGANIZATION_DASHBOARD_QUERY,
        {
            variables: { organizationId: organizationId ?? '' },
            skip: !organizationId,
        }
    );

    const courses = useMemo<CourseStats[]>(() => {
        if (!data?.organizationDashboard?.courseStats) {
            return [];
        }
        return data.organizationDashboard.courseStats.map((stat) => ({
            courseId: stat.course.id,
            courseName: stat.course.title,
            averageScore: Math.round(stat.averageScore ?? 0),
            enrolledCount: stat.enrolledCount,
            completionRate: Math.round((stat.completionRate ?? 0) * 100),
            topics: stat.course.topics?.map((topic) => ({
                id: topic.id,
                name: topic.name,
                dependencies: topic.dependencies ?? []
            })) ?? [],
            employees: stat.course.employees?.map((employee) => ({
                userId: employee.user.id,
                userName: employee.user.name,
                score: employee.overallScore ?? -1
            })) ?? []
        }));
    }, [data]);

    const filteredCourses = useMemo(() => 
        courses.filter(course => 
            course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
        ), [courses, searchQuery]);

    if (!organizationId) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">{t('navigation.management.courseScores.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('navigation.management.courseScores.selectOrg')}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">{t('navigation.management.courseScores.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400">{t('navigation.management.courseScores.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">{t('navigation.management.courseScores.title')}</h1>
                <p className="text-red-600">{t('navigation.management.courseScores.error', { message: error.message })}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('navigation.management.courseScores.title')}</h1>
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder={t('navigation.management.courseScores.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                 <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('navigation.management.courseScores.table.course')}</th>
                            <th scope="col" className="px-6 py-3">{t('navigation.management.courseScores.table.averageScore')}</th>
                            <th scope="col" className="px-6 py-3">{t('navigation.management.courseScores.table.enrolled')}</th>
                            <th scope="col" className="px-6 py-3">{t('navigation.management.courseScores.table.completion')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map(course => (
                            <tr key={course.courseId} onClick={() => setSelectedCourse(course)} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{course.courseName}</th>
                                <td className="px-6 py-4">{course.averageScore}%</td>
                                <td className="px-6 py-4">{course.enrolledCount}</td>
                                <td className="px-6 py-4">{course.completionRate}%</td>
                            </tr>
                        ))}
                        {filteredCourses.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {t('navigation.management.courseScores.empty')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                 </table>
            </div>

            {selectedCourse && (
                <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={t('navigation.management.courseScores.modal.title', { course: selectedCourse.courseName })}>
                   <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">{t('navigation.management.courseScores.modal.topics')}</h3>
                            <TopicGraph topics={selectedCourse.topics} />
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-2">{t('navigation.management.courseScores.modal.enrolled')}</h3>
                             <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-lg">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">{t('navigation.management.courseScores.modal.collaborator')}</th>
                                            <th scope="col" className="px-6 py-3">{t('navigation.management.courseScores.modal.score')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedCourse.employees.map(emp => (
                                            <tr key={emp.userId} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-6 py-4 font-medium">{emp.userName}</td>
                                                <td className="px-6 py-4">{emp.score >= 0 ? `${emp.score}%` : t('navigation.management.courseScores.modal.notAttempted')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {selectedCourse.employees.length === 0 && <p className="p-4 text-center">{t('navigation.management.courseScores.modal.none')}</p>}
                            </div>
                        </div>
                   </div>
                </Modal>
            )}
        </div>
    );
};

export default MgmtCourseScoresScreen;
