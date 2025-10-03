
import React, { useMemo } from 'react';
import { CourseTopic } from '../../types';

interface TopicGraphProps {
    topics: CourseTopic[];
}

const TopicGraph: React.FC<TopicGraphProps> = ({ topics }) => {
    const nodes = useMemo(() => {
        if (!topics || topics.length === 0) return [];
        const numTopics = topics.length;
        return topics.map((topic, i) => ({
            id: topic.id,
            name: topic.name,
            x: 100 + (i % 3) * 200,
            y: 100 + Math.floor(i / 3) * 120,
        }));
    }, [topics]);

    const edges = useMemo(() => {
        if (!nodes || nodes.length === 0) return [];
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const edges: { source: any; target: any }[] = [];
        topics.forEach(topic => {
            topic.dependencies.forEach(depId => {
                const source = nodeMap.get(depId);
                const target = nodeMap.get(topic.id);
                if (source && target) {
                    edges.push({ source, target });
                }
            });
        });
        return edges;
    }, [topics, nodes]);
    
    if (nodes.length === 0) {
        return <p className="text-center text-gray-500">No topics available to display graph.</p>;
    }

    return (
        <div className="w-full h-96 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-auto">
            <svg width="100%" height="100%" viewBox="0 0 700 400">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
                    </marker>
                </defs>
                {edges.map((edge, i) => (
                    <line
                        key={i}
                        x1={edge.source.x}
                        y1={edge.source.y}
                        x2={edge.target.x}
                        y2={edge.target.y}
                        stroke="#9ca3af"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                    />
                ))}
                {nodes.map(node => (
                    <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                        <circle r="40" fill="hsl(210, 40%, 95%)" stroke="hsl(210, 40%, 70%)" strokeWidth="2" />
                        <text
                            textAnchor="middle"
                            dy=".3em"
                            className="fill-current text-gray-700 dark:text-gray-200 text-xs font-semibold"
                            style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', width: '70px' }}
                        >
                           {node.name.length > 10 ? node.name.substring(0, 9) + '...' : node.name}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default TopicGraph;