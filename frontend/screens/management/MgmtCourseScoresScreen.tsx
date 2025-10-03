
import React, { useState, useMemo } from 'react';
import { SearchIcon } from '../../components/icons';
import { CourseStats, CourseTopic } from '../../types';
import Modal from '../../components/common/Modal';
import TopicGraph from '../../components/common/TopicGraph';

const mockTopics: CourseTopic[] = [
    { id: 't1', name: 'Introduction', dependencies: [] },
    { id: 't2', name: 'Core Concepts', dependencies: ['t1'] },
    { id: 't3', name: 'Advanced Hooks', dependencies: ['t2'] },
    { id: 't4', name: 'State Management', dependencies: ['t2'] },
    { id: 't5', name: 'Deployment', dependencies: ['t3', 't4'] },
];

const mockCourseData: CourseStats[] = [
    { courseId: 'c1', courseName: 'Advanced React', averageScore: 88, enrolledCount: 50, completionRate: 75, topics: mockTopics, employees: [
        {userId: 'u1', userName: 'Alice', score: 92}, {userId: 'u2', userName: 'Bob', score: 85}
    ]},
    { courseId: 'c2', courseName: 'UI/UX Design', averageScore: 92, enrolledCount: 45, completionRate: 85, topics: mockTopics.slice(0,3), employees: [
         {userId: 'u3', userName: 'Charlie', score: 95}, {userId: 'u4', userName: 'Diana', score: 90}
    ]},
    { courseId: 'c3', courseName: 'Agile Management', averageScore: 75, enrolledCount: 60, completionRate: 60, topics: [], employees: []},
];

const MgmtCourseScoresScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<CourseStats | null>(null);

    const filteredCourses = useMemo(() => 
        mockCourseData.filter(course => 
            course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
        ), [searchQuery]);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Course Scores</h1>
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search for a course..."
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
                            <th scope="col" className="px-6 py-3">Course Name</th>
                            <th scope="col" className="px-6 py-3">Avg. Score</th>
                            <th scope="col" className="px-6 py-3">Enrolled</th>
                            <th scope="col" className="px-6 py-3">Completion</th>
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
                    </tbody>
                 </table>
            </div>

            {selectedCourse && (
                <Modal isOpen={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={`${selectedCourse.courseName} Statistics`}>
                   <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Topic Dependency Graph</h3>
                            <TopicGraph topics={selectedCourse.topics} />
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-2">Enrolled Collaborators</h3>
                             <div className="max-h-60 overflow-y-auto border dark:border-gray-700 rounded-lg">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Collaborator</th>
                                            <th scope="col" className="px-6 py-3">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedCourse.employees.map(emp => (
                                            <tr key={emp.userId} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-6 py-4 font-medium">{emp.userName}</td>
                                                <td className="px-6 py-4">{emp.score}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {selectedCourse.employees.length === 0 && <p className="p-4 text-center">No collaborators enrolled yet.</p>}
                            </div>
                        </div>
                   </div>
                </Modal>
            )}
        </div>
    );
};

export default MgmtCourseScoresScreen;