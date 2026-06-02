import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { authService as defaultAuthService } from './services/auth-service.js';
import { profileService as defaultProfileService } from './services/profile-service.js';
import { usersService as defaultUsersService } from './services/users-service.js';
import { createAuthRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { createProfileRouter } from './routes/profile.js';
import { createUsersRouter } from './routes/users.js';

export function createApp({
  authService = defaultAuthService,
  profileService = defaultProfileService,
  usersService = defaultUsersService,
} = {}) {
  const app = express();

  app.use(
    cors({//允许前端跨端查询后端。
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use(healthRouter);
  app.use('/api/auth', createAuthRouter(authService));
  app.use('/api/profile', createProfileRouter(authService, profileService));
  app.use('/api/users', createUsersRouter(authService, usersService));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((error, _req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    res.status(error.status ?? 500).json({
      error: error.message ?? 'Internal server error',
    });
  });

  return app;
}

export const app = createApp();
