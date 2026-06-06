import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { authService as defaultAuthService } from './services/auth-service.js';
import { callService as defaultCallService } from './services/call-service.js';
import { chatService as defaultChatService } from './services/chat-service.js';
import { friendsService as defaultFriendsService } from './services/friends-service.js';
import { notificationsService as defaultNotificationsService } from './services/notifications-service.js';
import { profileService as defaultProfileService } from './services/profile-service.js';
import { usersService as defaultUsersService } from './services/users-service.js';
import { createAuthRouter } from './routes/auth.js';
import { createCallRouter } from './routes/call.js';
import { createChatRouter } from './routes/chat.js';
import { createFriendsRouter } from './routes/friends.js';
import { healthRouter } from './routes/health.js';
import { createNotificationsRouter } from './routes/notifications.js';
import { createProfileRouter } from './routes/profile.js';
import { createUsersRouter } from './routes/users.js';

export function createApp({
  authService = defaultAuthService,
  callService = defaultCallService,
  chatService = defaultChatService,
  friendsService = defaultFriendsService,
  notificationsService = defaultNotificationsService,
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
  app.use('/api/friends', createFriendsRouter(authService, friendsService));
  app.use('/api/call', createCallRouter(authService, callService));
  app.use('/api/chat', createChatRouter(authService, chatService));
  app.use('/api/notifications', createNotificationsRouter(authService, notificationsService));

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
