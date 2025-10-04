import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserGroupIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon } from '../../components/icons';
import { CourseStats } from '../../types';
import { ORGANIZATION_DASHBOARD_QUERY } from '../../graphql/queries';
import { useAuth } from '../../contexts/AuthContext';

interface OrganizationDashboardData {
    organizationDashboard: {
        totalEmployees: number;
        activeCourses: number;
        averageScore: number | null;
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

const getScoreHealthColor = (score: number | null | undefined) => {
    if (score === null || score === undefined || Number.isNaN(score)) {
        return 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
    if (score >= 85) return 'bg-success/20 text-success';
    if (score >= 70) return 'bg-warning/20 text-warning';
    return 'bg-danger/20 text-danger';
};

const MgmtHomeScreen: React.FC = () => {
    const { user } = useAuth();
    const organizationId = user?.organizationId;

    const { data, loading, error } = useQuery<OrganizationDashboardData>(
        ORGANIZATION_DASHBOARD_QUERY,
        {
            variables: { organizationId: organizationId ?? '' },
            skip: !organizationId,
        }
    );

    const courseStats: CourseStats[] = useMemo(() => {
        if (!data?.organizationDashboard?.courseStats) {
            return [];
        }
        return data.organizationDashboard.courseStats.map((courseStat) => ({
            courseId: courseStat.course.id,
            courseName: courseStat.course.title,
            averageScore: Math.round(courseStat.averageScore ?? 0),
            enrolledCount: courseStat.enrolledCount,
            completionRate: Math.round((courseStat.completionRate ?? 0) * 100),
            topics: courseStat.course.topics?.map((topic) => ({
                id: topic.id,
                name: topic.name,
                dependencies: topic.dependencies ?? []
            })) ?? [],
            employees: courseStat.course.employees?.map((employee) => ({
                userId: employee.user.id,
                userName: employee.user.name,
                score: employee.overallScore ?? -1
            })) ?? []
        }));
    }, [data]);

    const totalCollaborators = data?.organizationDashboard?.totalEmployees ?? 0;
    const activeCourses = data?.organizationDashboard?.activeCourses ?? 0;
    const avgScore = data?.organizationDashboard?.averageScore;
    const avgCompletion = useMemo(() => {
        if (courseStats.length === 0) {
            return null;
        }
        const total = courseStats.reduce((acc, stat) => acc + stat.completionRate, 0);
        return Math.round(total / courseStats.length);
    }, [courseStats]);

    if (!organizationId) {
        return (
            <div className="container mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Management Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Select an organization to view analytics.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Management Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Management Dashboard</h1>
                <p className="text-red-600">Failed to load dashboard: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Management Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Collaborators" value={totalCollaborators.toString()} icon={<UserGroupIcon className="w-6 h-6"/>} />
                <StatCard title="Active Courses" value={activeCourses.toString()} icon={<BookOpenIcon className="w-6 h-6"/>} />
                <StatCard title="Average Score" value={avgScore !== null && avgScore !== undefined ? `${Math.round(avgScore)}%` : '—'} icon={<AcademicCapIcon className="w-6 h-6"/>} />
                <StatCard title="Avg Completion" value={avgCompletion !== null && avgCompletion !== undefined ? `${avgCompletion}%` : '—'} icon={<ChartBarIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Course Performance</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={courseStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="courseName" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                                <Legend />
                                <Bar dataKey="averageScore" fill="#8884d8" name="Average Score (%)" />
                                <Bar dataKey="completionRate" fill="#82ca9d" name="Completion Rate (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                     <h2 className="text-xl font-semibold mb-4">Course Health</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Course</th>
                                    <th scope="col" className="px-6 py-3">Avg Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseStats.map(stat => (
                                    <tr key={stat.courseId} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{stat.courseName}</th>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full font-semibold ${getScoreHealthColor(stat.averageScore)}`}>
                                                {stat.averageScore}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MgmtHomeScreen;
