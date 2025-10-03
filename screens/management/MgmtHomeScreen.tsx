import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserGroupIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon } from '../../components/icons';
import { CourseStats } from '../../types';

// FIX: Added missing 'topics' and 'employees' properties to each object to match the CourseStats type.
const mockCourseStats: CourseStats[] = [
    { courseId: 'c1', courseName: 'Advanced React', averageScore: 88, enrolledCount: 50, completionRate: 75, topics: [], employees: [] },
    { courseId: 'c2', courseName: 'UI/UX Design', averageScore: 92, enrolledCount: 45, completionRate: 85, topics: [], employees: [] },
    { courseId: 'c3', courseName: 'Agile Management', averageScore: 75, enrolledCount: 60, completionRate: 60, topics: [], employees: [] },
    { courseId: 'c4', courseName: 'Node.js Backend', averageScore: 65, enrolledCount: 30, completionRate: 50, topics: [], employees: [] },
    { courseId: 'c5', courseName: 'Data Science Intro', averageScore: 95, enrolledCount: 25, completionRate: 90, topics: [], employees: [] },
];

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

const getScoreHealthColor = (score: number) => {
    if (score >= 85) return 'bg-success/20 text-success';
    if (score >= 70) return 'bg-warning/20 text-warning';
    return 'bg-danger/20 text-danger';
};

const MgmtHomeScreen: React.FC = () => {
    const totalCollaborators = 125;
    const activeCourses = 12;
    const avgScore = 82;

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Management Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Collaborators" value={totalCollaborators.toString()} icon={<UserGroupIcon className="w-6 h-6"/>} />
                <StatCard title="Active Courses" value={activeCourses.toString()} icon={<BookOpenIcon className="w-6 h-6"/>} />
                <StatCard title="Average Score" value={`${avgScore}%`} icon={<AcademicCapIcon className="w-6 h-6"/>} />
                <StatCard title="Avg Completion" value="72%" icon={<ChartBarIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Course Performance</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockCourseStats}>
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
                                {mockCourseStats.map(stat => (
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