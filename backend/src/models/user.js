'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      avatarUrl: {
        type: DataTypes.STRING,
        field: 'avatar_url'
      },
      roles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      groupsMeta: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        field: 'groups_meta'
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'INVITED'),
        defaultValue: 'ACTIVE'
      },
      themePreference: {
        type: DataTypes.ENUM('light', 'dark', 'system'),
        allowNull: false,
        defaultValue: 'system',
        field: 'theme_preference'
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        field: 'last_login_at'
      }
    },
    {
      tableName: 'users',
      underscored: true
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization'
    });

    User.belongsToMany(models.Group, {
      through: models.UserGroup,
      foreignKey: 'user_id',
      otherKey: 'group_id',
      as: 'groups'
    });

    User.hasMany(models.UserCourse, {
      foreignKey: 'user_id',
      as: 'enrollments'
    });
  };

  return User;
};
