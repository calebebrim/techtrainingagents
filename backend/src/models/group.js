'use strict';

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define(
    'Group',
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_system'
      }
    },
    {
      tableName: 'groups',
      underscored: true
    }
  );

  Group.associate = (models) => {
    Group.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization'
    });

    Group.belongsToMany(models.User, {
      through: models.UserGroup,
      foreignKey: 'group_id',
      otherKey: 'user_id',
      as: 'members'
    });
  };

  return Group;
};
