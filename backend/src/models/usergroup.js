'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserGroup = sequelize.define(
    'UserGroup',
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
      groupId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'group_id'
      }
    },
    {
      tableName: 'user_groups',
      underscored: true
    }
  );

  return UserGroup;
};
