const gql = require('graphql-tag');

const typeDefs = gql`
  enum EnrollmentStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLETED
    ARCHIVED
  }

  enum CourseLevel {
    beginner
    intermediate
    advanced
  }

  enum CourseStatus {
    draft
    published
    archived
  }

  enum CourseHealth {
    GREEN
    YELLOW
    RED
  }

  type Organization {
    id: ID!
    name: String!
    slug: String
    cnpj: String
    domain: String
    description: String
    logoUrl: String
    plan: String
    users: [User!]!
    courses: [Course!]!
    groups: [Group!]!
    dashboard: OrganizationDashboard!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    avatarUrl: String
    roles: [String!]!
    status: String!
    themePreference: String!
    organization: Organization!
    groups: [Group!]!
    enrollments: [Enrollment!]!
  }

  type Group {
    id: ID!
    name: String!
    description: String
    isSystem: Boolean!
    organization: Organization!
    members: [User!]!
  }

  type CourseTopic {
    id: ID!
    name: String!
    summary: String
    position: Int!
    dependencies: [ID!]!
    estimatedMinutes: Int
  }

  type TopicScore {
    topicId: ID!
    topicName: String!
    score: Int!
  }

  type EmployeeScore {
    user: User!
    overallScore: Float
    progress: Float!
    status: EnrollmentStatus!
    topicScores: [TopicScore!]!
  }

  type Course {
    id: ID!
    title: String!
    description: String
    thumbnailUrl: String
    category: String
    level: CourseLevel!
    status: CourseStatus!
    estimatedHours: Float
    organization: Organization!
    topics: [CourseTopic!]!
    enrollments: [Enrollment!]!
    averageScore: Float
    completionRate: Float!
    enrolledCount: Int!
    health: CourseHealth!
    employees: [EmployeeScore!]!
  }

  type Enrollment {
    id: ID!
    status: EnrollmentStatus!
    progress: Float!
    score: Float
    startedAt: String
    completedAt: String
    lastAccessedAt: String
    topicScores: [TopicScore!]!
    user: User!
    course: Course!
  }

  type CourseStats {
    course: Course!
    averageScore: Float
    enrolledCount: Int!
    completionRate: Float!
    health: CourseHealth!
  }

  type OrganizationDashboard {
    organization: Organization!
    totalEmployees: Int!
    activeCourses: Int!
    averageScore: Float
    courseStats: [CourseStats!]!
  }

  input OrganizationInput {
    name: String!
    slug: String
    cnpj: String
    domain: String
    description: String
    logoUrl: String
  }

  input CourseInput {
    organizationId: ID!
    title: String!
    description: String
    thumbnailUrl: String
    category: String
    level: CourseLevel
    status: CourseStatus
    estimatedHours: Float
  }

  input CourseTopicInput {
    courseId: ID!
    name: String!
    summary: String
    position: Int
    dependencies: [ID!]
    estimatedMinutes: Int
  }

  input GroupInput {
    organizationId: ID!
    name: String!
    description: String
  }

  input EnrollmentInput {
    userId: ID!
    courseId: ID!
    status: EnrollmentStatus
    progress: Float
    score: Float
  }

  input TopicScoreInput {
    topicId: ID!
    topicName: String
    score: Int!
  }

  type Viewer {
    user: User!
    authUser: User!
    isImpersonating: Boolean!
  }

  type Query {
    organizations: [Organization!]!
    organization(id: ID, slug: String): Organization
    courses(organizationId: ID!, search: String): [Course!]!
    course(id: ID!): Course
    users(organizationId: ID!): [User!]!
    user(id: ID!): User
    groups(organizationId: ID!): [Group!]!
    enrollments(organizationId: ID, courseId: ID, userId: ID): [Enrollment!]!
    organizationDashboard(organizationId: ID!): OrganizationDashboard!
    employeeCourseScores(organizationId: ID!, courseId: ID): [EmployeeScore!]!
    me: User
    viewer: Viewer!
  }

  type Mutation {
    createOrganization(input: OrganizationInput!): Organization!
    createCourse(input: CourseInput!): Course!
    addCourseTopic(input: CourseTopicInput!): CourseTopic!
    enrollUser(input: EnrollmentInput!): Enrollment!
    updateEnrollmentScore(
      enrollmentId: ID!
      progress: Float
      score: Float
      topicScores: [TopicScoreInput!]
    ): Enrollment!
    createGroup(input: GroupInput!): Group!
    assignUserToGroup(userId: ID!, groupId: ID!): Group!
    removeUserFromGroup(userId: ID!, groupId: ID!): Boolean!
  }
`;

module.exports = typeDefs;
