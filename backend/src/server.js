const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const http = require('http');
const dotenv = require('dotenv');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const models = require('./models');

const registerEnvFiles = () => {
  dotenv.config();
  const localEnv = path.resolve(__dirname, '../../.env.local');
  dotenv.config({ path: localEnv });
};

const bootstrap = async () => {
  registerEnvFiles();

  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(bodyParser.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production'
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const userId = req.headers['x-user-id'];
        let user = null;
        if (userId) {
          user = await models.User.findByPk(userId);
        }
        return {
          user,
          models
        };
      }
    })
  );

  app.get('/health', async (_req, res) => {
    try {
      await models.sequelize.authenticate();
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  const port = process.env.PORT || 4000;

  try {
    await models.sequelize.authenticate();
    if (process.env.SYNC_DB === 'true' || process.env.NODE_ENV === 'test') {
      await models.sequelize.sync();
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log(`🚀 GraphQL ready at http://localhost:${port}/graphql`);
};

if (require.main === module) {
  bootstrap();
}

module.exports = bootstrap;
