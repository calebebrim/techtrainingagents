const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const envConfig = config[env];

if (!envConfig) {
  throw new Error(`Database configuration for environment "${env}" was not found`);
}

let sequelize;

if (envConfig.use_env_variable) {
  const url = process.env[envConfig.use_env_variable];
  if (!url) {
    throw new Error(`Environment variable ${envConfig.use_env_variable} is not set`);
  }
  sequelize = new Sequelize(url, envConfig);
} else if (envConfig.url) {
  sequelize = new Sequelize(envConfig.url, envConfig);
} else {
  sequelize = new Sequelize(envConfig);
}

module.exports = sequelize;
