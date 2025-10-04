import { gql } from '@apollo/client';

export const ORGANIZATION_DASHBOARD_QUERY = gql`
    query OrganizationDashboard($organizationId: ID!) {
        organizationDashboard(organizationId: $organizationId) {
            organization {
                id
                name
            }
            totalEmployees
            activeCourses
            averageScore
            courseStats {
                averageScore
                enrolledCount
                completionRate
                health
                course {
                    id
                    title
                    description
                    thumbnailUrl
                    category
                    level
                    status
                    estimatedHours
                    topics {
                        id
                        name
                        summary
                        position
                        dependencies
                        estimatedMinutes
                    }
                    employees {
                        user {
                            id
                            name
                            email
                            avatarUrl
                        }
                        overallScore
                        progress
                        status
                        topicScores {
                            topicId
                            topicName
                            score
                        }
                    }
                }
            }
        }
    }
`;

export const EMPLOYEE_COURSE_SCORES_QUERY = gql`
    query EmployeeCourseScores($organizationId: ID!, $courseId: ID) {
        employeeCourseScores(organizationId: $organizationId, courseId: $courseId) {
            user {
                id
                name
                email
                avatarUrl
            }
            overallScore
            progress
            status
            topicScores {
                topicId
                topicName
                score
            }
        }
    }
`;

export const ORGANIZATION_USERS_QUERY = gql`
    query OrganizationUsers($organizationId: ID!) {
        users(organizationId: $organizationId) {
            id
            name
            email
            avatarUrl
            roles
            groups {
                id
                name
            }
        }
    }
`;

export const ORGANIZATION_GROUPS_QUERY = gql`
    query OrganizationGroups($organizationId: ID!) {
        groups(organizationId: $organizationId) {
            id
            name
            description
            isSystem
        }
    }
`;

export const ORGANIZATION_ENROLLMENTS_QUERY = gql`
    query OrganizationEnrollments($organizationId: ID!) {
        enrollments(organizationId: $organizationId) {
            id
            status
            progress
            score
            topicScores {
                topicId
                topicName
                score
            }
            user {
                id
                name
                email
                avatarUrl
            }
            course {
                id
                title
                topics {
                    id
                    name
                }
            }
        }
    }
`;

export const USER_ENROLLMENTS_QUERY = gql`
    query UserEnrollments($userId: ID!) {
        enrollments(userId: $userId) {
            id
            status
            progress
            score
            course {
                id
                title
            }
        }
    }
`;
