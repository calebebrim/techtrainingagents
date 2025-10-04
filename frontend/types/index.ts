
export enum UserRole {
    SYSTEM_ADMIN = 'System Admin',
    ADMIN = 'Administrator',
    TECHNICAL_STAFF = 'Technical Staff',
    COURSE_COORDINATOR = 'Course Coordinator',
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    roles: UserRole[];
    organizationId: string;
    organizationName?: string;
    status?: string;
    themePreference?: string;
    groups?: string[]; // Group IDs or names
}

export interface CourseTopic {
    id: string;
    name: string;
    dependencies: string[]; // array of topic ids
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    category: string;
    topics: CourseTopic[];
}


export interface TopicScore {
    topicId: string;
    topicName: string;
    score: number; // -1 for not started
}

export interface EmployeeCourseScore {
    userId: string;
    userName: string;
    avatarUrl?: string | null;
    courseId: string;
    courseName: string;
    overallScore: number;
    topicScores: TopicScore[];
    status?: string;
    progress?: number;
}

export interface CourseStats {
    courseId: string;
    courseName: string;
    averageScore: number;
    enrolledCount: number;
    completionRate: number;
    topics: CourseTopic[];
    employees: {
        userId: string;
        userName: string;
        score: number;
    }[];
}

export interface UserGroup {
    id: string;
    name: string;
    description: string;
}
