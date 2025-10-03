import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpenIcon, AdjustmentsIcon, AcademicCapIcon, ChevronRightIcon } from '../../components/icons';
import { Link } from 'react-router-dom';

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

    return (
        <div className="container mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Here's a summary of your learning journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Courses in Progress" value="5" icon={<BookOpenIcon className="w-6 h-6"/>} />
                <StatCard title="Learning Paths" value="2" icon={<AdjustmentsIcon className="w-6 h-6"/>} />
                <StatCard title="Certificates Earned" value="3" icon={<AcademicCapIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
                    {/* This would be populated with actual user data */}
                    <div className="space-y-3">
                        <div className="p-3 border dark:border-gray-700 rounded-lg">
                            <p className="font-medium">Advanced React</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{width: '75%'}}></div>
                            </div>
                        </div>
                         <div className="p-3 border dark:border-gray-700 rounded-lg">
                            <p className="font-medium">UI/UX Design Principles</p>
                             <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{width: '45%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Quick Links</h2>
                    <div className="space-y-4">
                        <QuickLink to="/my-courses" title="My Courses" description="View all your enrolled courses." />
                        <QuickLink to="/my-paths" title="Learning Paths" description="Check your progress on assigned paths." />
                        <QuickLink to="/search" title="Explore New Courses" description="Find new skills to learn." />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgHomeScreen;