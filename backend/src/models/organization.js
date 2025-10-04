'use strict';

module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    'Organization',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING,
        unique: true
      },
      cnpj: {
        type: DataTypes.STRING
      },
      domain: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      logoUrl: {
        type: DataTypes.STRING
      },
      plan: {
        type: DataTypes.STRING,
        defaultValue: 'standard'
      }
    },
    {
      tableName: 'organizations',
      underscored: true
    }
  );

  Organization.associate = (models) => {
    Organization.hasMany(models.User, {
      foreignKey: 'organization_id',
      as: 'users'
    });

    Organization.hasMany(models.Course, {
      foreignKey: 'organization_id',
      as: 'courses'
    });

    Organization.hasMany(models.Group, {
      foreignKey: 'organization_id',
      as: 'groups'
    });
  };

  return Organization;
};
