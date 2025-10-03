
import React, { useState, useMemo } from 'react';
import { SearchIcon } from '../../components/icons';
import { EmployeeCourseScore, TopicScore } from '../../types';
import Modal from '../../components/common/Modal';

const mockEmployeeScores: EmployeeCourseScore[] = [
    { userId: 'u1', userName: 'Alice Smith', avatarUrl: 'https://picsum.photos/seed/u1/100/100', courseId: 'c1', courseName: 'Advanced React', overallScore: 92, topicScores: [
        { topicId: 't1', topicName: 'Introduction', score: 100 },
        { topicId: 't2', topicName: 'Core Concepts', score: 95 },
        { topicId: 't3', topicName: 'Advanced Hooks', score: 88 },
        { topicId: 't4', topicName: 'State Management', score: 90 },
    ]},
    { userId: 'u2', userName: 'Bob Johnson', avatarUrl: 'https://picsum.photos/seed/u2/100/100', courseId: 'c1', courseName: 'Advanced React', overallScore: 85, topicScores: [
        { topicId: 't1', topicName: 'Introduction', score: 90 },
        { topicId: 't2', topicName: 'Core Concepts', score: 85 },
        { topicId: 't3', topicName: 'Advanced Hooks', score: 80 },
        { topicId: 't4', topicName: 'State Management', score: -1 }, // Not started
    ]},
     { userId: 'u3', userName: 'Charlie Brown', avatarUrl: 'https://picsum.photos/seed/u3/100/100', courseId: 'c2', courseName: 'UI/UX Design', overallScore: 95, topicScores: [
        { topicId: 'd1', topicName: 'Figma Basics', score: 98 },
        { topicId: 'd2', topicName: 'Prototyping', score: 92 },
    ]},
];

const ScoreBadge: React.FC<{score: number}> = ({ score }) => {
    if (score === -1) {
        return <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 rounded-full">Not Attempted</span>
    }
    const color = score >= 85 ? 'bg-success/20 text-success' : score >= 70 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger';
    return <span className={`px-2 py-1 font-semibold rounded-full ${color}`}>{score}%</span>
};


const MgmtEmployeeScoresScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedScore, setSelectedScore] = useState<EmployeeCourseScore | null>(null);

    const filteredScores = useMemo(() =>
        mockEmployeeScores.filter(s =>
            s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.courseName.toLowerCase().includes(searchQuery.toLowerCase())
        ), [searchQuery]);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Employee Scores</h1>
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search for an employee by name or course..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
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
                            <th scope="col" className="px-6 py-3">Employee</th>
                            <th scope="col" className="px-6 py-3">Course</th>
                            <th scope="col" className="px-6 py-3">Overall Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredScores.map(score => (
                            <tr key={`${score.userId}-${score.courseId}`} onClick={() => setSelectedScore(score)} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                <td className="px-6 py-4 flex items-center">
                                    <img src={score.avatarUrl} alt={score.userName} className="w-8 h-8 rounded-full mr-3" />
                                    <span className="font-medium text-gray-900 dark:text-white">{score.userName}</span>
                                </td>
                                <td className="px-6 py-4">{score.courseName}</td>
                                <td className="px-6 py-4"><ScoreBadge score={score.overallScore} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedScore && (
                 <Modal isOpen={!!selectedScore} onClose={() => setSelectedScore(null)} title={`Report Card: ${selectedScore.userName}`}>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold">{selectedScore.courseName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Overall Score: <ScoreBadge score={selectedScore.overallScore}/></p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Topic Breakdown:</h4>
                            <ul className="space-y-2">
                                {selectedScore.topicScores.map(topicScore => (
                                    <li key={topicScore.topicId} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg">
                                        <span>{topicScore.topicName}</span>
                                        <ScoreBadge score={topicScore.score} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default MgmtEmployeeScoresScreen;
