'use strict';

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    'Course',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'organization_id'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      thumbnailUrl: {
        type: DataTypes.STRING,
        field: 'thumbnail_url'
      },
      category: {
        type: DataTypes.STRING
      },
      level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'intermediate'
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'published'
      },
      estimatedHours: {
        type: DataTypes.FLOAT,
        field: 'estimated_hours'
      }
    },
    {
      tableName: 'courses',
      underscored: true
    }
  );

  Course.associate = (models) => {
    Course.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization'
    });

    Course.hasMany(models.CourseTopic, {
      foreignKey: 'course_id',
      as: 'topics'
    });

    Course.hasMany(models.UserCourse, {
      foreignKey: 'course_id',
      as: 'enrollments'
    });
  };

  return Course;
};
