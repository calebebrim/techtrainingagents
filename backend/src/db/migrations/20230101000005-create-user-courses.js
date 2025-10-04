'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_courses', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      course_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'NOT_STARTED'
      },
      progress: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      score: {
        type: Sequelize.FLOAT
      },
      topic_scores: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
      },
      started_at: {
        type: Sequelize.DATE
      },
      completed_at: {
        type: Sequelize.DATE
      },
      last_accessed_at: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('user_courses', {
      fields: ['user_id', 'course_id'],
      type: 'unique',
      name: 'user_courses_user_id_course_id_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('user_courses', 'user_courses_user_id_course_id_unique');
    await queryInterface.dropTable('user_courses');
  }
};
