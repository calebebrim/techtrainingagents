
import React from 'react';

const UserCoursesScreen: React.FC = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Courses</h1>
            <p className="text-gray-600 dark:text-gray-400">This page will display a list of courses you are currently enrolled in.</p>
             {/* Course list component would go here */}
        </div>
    );
};

export default UserCoursesScreen;