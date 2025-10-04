'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserCourse = sequelize.define(
    'UserCourse',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id'
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'course_id'
      },
      status: {
        type: DataTypes.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'),
        defaultValue: 'NOT_STARTED'
      },
      progress: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      score: {
        type: DataTypes.FLOAT
      },
      topicScores: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'topic_scores'
      },
      startedAt: {
        type: DataTypes.DATE,
        field: 'started_at'
      },
      completedAt: {
        type: DataTypes.DATE,
        field: 'completed_at'
      },
      lastAccessedAt: {
        type: DataTypes.DATE,
        field: 'last_accessed_at'
      }
    },
    {
      tableName: 'user_courses',
      underscored: true
    }
  );

  UserCourse.associate = (models) => {
    UserCourse.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    UserCourse.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
  };

  return UserCourse;
};
