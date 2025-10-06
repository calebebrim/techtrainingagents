'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'organization_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'organization_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  }
};
