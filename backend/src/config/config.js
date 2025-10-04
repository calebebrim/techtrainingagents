const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../..', '.env.local') });
require('dotenv').config();

const ensureStorageDir = (storagePath) => {
  if (!storagePath) {
    return storagePath;
  }
  const directory = path.dirname(storagePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  return storagePath;
};

const sqliteStorage = process.env.SQLITE_STORAGE || path.resolve(__dirname, '../../data/dev.sqlite');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: ensureStorageDir(sqliteStorage),
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined
    }
  }
};
