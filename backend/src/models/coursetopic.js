'use strict';

module.exports = (sequelize, DataTypes) => {
  const CourseTopic = sequelize.define(
    'CourseTopic',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'course_id'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      summary: {
        type: DataTypes.TEXT
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      dependencies: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      estimatedMinutes: {
        type: DataTypes.INTEGER,
        field: 'estimated_minutes'
      }
    },
    {
      tableName: 'course_topics',
      underscored: true
    }
  );

  CourseTopic.associate = (models) => {
    CourseTopic.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course'
    });
  };

  return CourseTopic;
};
