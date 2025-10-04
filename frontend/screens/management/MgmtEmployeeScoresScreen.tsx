import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { SearchIcon } from '../../components/icons';
import { EmployeeCourseScore } from '../../types';
import Modal from '../../components/common/Modal';
import { ORGANIZATION_ENROLLMENTS_QUERY } from '../../graphql/queries';
import { useAuth } from '../../contexts/AuthContext';

interface EnrollmentsQueryData {
    enrollments: Array<{
        id: string;
        status: string;
        progress: number;
        score: number | null;
        topicScores: Array<{
            topicId: string;
            topicName: string;
            score: number;
        }>;
        user: {
            id: string;
            name: string;
            avatarUrl?: string | null;
        };
        course: {
            id: string;
            title: string;
        };
    }>;
}

const ScoreBadge: React.FC<{score: number}> = ({ score }) => {
    if (score === -1) {
        return <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 rounded-full">Not Attempted</span>
    }
    const color = score >= 85 ? 'bg-success/20 text-success' : score >= 70 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger';
    return <span className={`px-2 py-1 font-semibold rounded-full ${color}`}>{score}%</span>
};

const formatStatus = (status?: string) => {
    if (!status) return '—';
    return status
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};


const MgmtEmployeeScoresScreen: React.FC = () => {
    const { user } = useAuth();
    const organizationId = user?.organizationId;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedScore, setSelectedScore] = useState<EmployeeCourseScore | null>(null);

    const { data, loading, error } = useQuery<EnrollmentsQueryData>(
        ORGANIZATION_ENROLLMENTS_QUERY,
        {
            variables: { organizationId: organizationId ?? '' },
            skip: !organizationId,
        }
    );

    const scores = useMemo<EmployeeCourseScore[]>(() => {
        if (!data?.enrollments) {
            return [];
        }
        return data.enrollments.map((enrollment) => ({
            userId: enrollment.user.id,
            userName: enrollment.user.name,
            avatarUrl: enrollment.user.avatarUrl,
            courseId: enrollment.course.id,
            courseName: enrollment.course.title,
            overallScore: typeof enrollment.score === 'number' ? Math.round(enrollment.score) : -1,
            topicScores: enrollment.topicScores.map((topicScore) => ({
                topicId: topicScore.topicId,
                topicName: topicScore.topicName,
                score: topicScore.score ?? -1,
            })),
            status: enrollment.status,
            progress: Math.round((enrollment.progress ?? 0) * 100),
        }));
    }, [data]);

    const filteredScores = useMemo(() =>
        scores.filter(s =>
            s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.courseName.toLowerCase().includes(searchQuery.toLowerCase())
        ), [scores, searchQuery]);

    if (!organizationId) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Employee Scores</h1>
                <p className="text-gray-600 dark:text-gray-400">Select an organization to view employee performance.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Employee Scores</h1>
                <p className="text-gray-600 dark:text-gray-400">Loading employee performance...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Employee Scores</h1>
                <p className="text-red-600">Failed to load employee scores: {error.message}</p>
            </div>
        );
    }

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
                                    {score.avatarUrl ? (
                                        <img src={score.avatarUrl} alt={score.userName} className="w-8 h-8 rounded-full mr-3 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full mr-3 bg-primary-600 text-white flex items-center justify-center uppercase text-sm">
                                            {score.userName.charAt(0)}
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-900 dark:text-white">{score.userName}</span>
                                </td>
                                <td className="px-6 py-4">{score.courseName}</td>
                                <td className="px-6 py-4"><ScoreBadge score={score.overallScore} /></td>
                            </tr>
                        ))}
                        {filteredScores.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No employees match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedScore && (
                 <Modal isOpen={!!selectedScore} onClose={() => setSelectedScore(null)} title={`Report Card: ${selectedScore.userName}`}>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold">{selectedScore.courseName}</h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                                <span>Overall Score: <ScoreBadge score={selectedScore.overallScore}/></span>
                                <span>Status: {formatStatus(selectedScore.status)}</span>
                                <span>Progress: {typeof selectedScore.progress === 'number' ? `${selectedScore.progress}%` : '—'}</span>
                            </div>
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
                                {selectedScore.topicScores.length === 0 && (
                                    <li className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg">
                                        No topic scores recorded yet.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default MgmtEmployeeScoresScreen;
