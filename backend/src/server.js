const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const http = require('http');
const dotenv = require('dotenv');

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

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

  const shouldLogGraphQlErrors = process.env.NODE_ENV !== 'test';

  const authSecret = process.env.AUTH_JWT_SECRET || 'change-me-in-production';
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleOAuthClient = googleClientId && googleClientSecret
    ? new OAuth2Client(googleClientId, googleClientSecret, 'postmessage')
    : null;

  const userInclude = [
    { model: models.Organization, as: 'organization' },
    { model: models.Group, as: 'groups' }
  ];

  const loadUserFromRequest = async (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length).trim();
      try {
        const decoded = jwt.verify(token, authSecret);
        if (decoded && decoded.userId) {
          const user = await models.User.findByPk(decoded.userId, { include: userInclude });
          if (user) {
            return user;
          }
        }
      } catch (error) {
        console.warn('Failed to verify auth token', error);
      }
    }

    const userId = req.headers['x-user-id'];
    if (userId) {
      const fallbackUser = await models.User.findByPk(userId, { include: userInclude });
      if (fallbackUser) {
        return fallbackUser;
      }
    }

    return null;
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (formattedError, error) => {
      if (shouldLogGraphQlErrors) {
        const originalError = error.originalError || error;
        console.error('GraphQL error:', {
          message: originalError.message,
          path: formattedError.path,
          extensions: formattedError.extensions,
          stack: originalError.stack
        });
      }
      return formattedError;
    }
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const user = await loadUserFromRequest(req);
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

  app.post('/auth/google', async (req, res) => {
    if (!googleOAuthClient) {
      res.status(500).json({ error: 'Google authentication is not configured on the server.' });
      return;
    }

    const { code } = req.body || {};
    if (!code) {
      res.status(400).json({ error: 'Missing Google authorization code.' });
      return;
    }

    try {
      const tokenResponse = await googleOAuthClient.getToken({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: 'postmessage'
      });

      const { tokens } = tokenResponse;
      if (!tokens || !tokens.id_token) {
        throw new Error('Google response did not include an ID token');
      }

      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: googleClientId
      });

      const payload = ticket.getPayload();
      const email = payload?.email;
      if (!email) {
        throw new Error('Google account did not provide an email.');
      }

      const user = await models.User.findOne({
        where: { email },
        include: userInclude
      });

      if (!user) {
        res.status(403).json({ error: 'User is not authorized to access this platform.' });
        return;
      }

      const updates = {
        lastLoginAt: new Date()
      };

      if (payload?.name && payload.name !== user.name) {
        updates.name = payload.name;
      }

      if (payload?.picture && payload.picture !== user.avatarUrl) {
        updates.avatarUrl = payload.picture;
      }

      await user.update(updates);

      const freshUser = await models.User.findByPk(user.id, { include: userInclude });
      const token = jwt.sign({ userId: user.id }, authSecret, { expiresIn: '7d' });

      res.json({
        token,
        user: freshUser
      });
    } catch (error) {
      console.error('Google authentication failed:', error);
      res.status(401).json({ error: 'Failed to authenticate with Google.' });
    }
  });

  app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal server error' });
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
