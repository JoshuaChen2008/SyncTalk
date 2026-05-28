import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

export const SESSION_COOKIE_NAME = 'synctalk_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}

function clearCookieOptions() {
  return {
    ...cookieOptions(),
    maxAge: 0,
  };
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function writeSessionCookie(res, token) {
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions());
}

export function createAuthRouter(authService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.post(
    '/register',
    asyncRoute(async (req, res) => {
      const result = await authService.register(req.body);
      writeSessionCookie(res, result.token);
      res.status(201).json({ user: result.user });
    }),
  );

  router.post(
    '/login',
    asyncRoute(async (req, res) => {
      const result = await authService.login(req.body);
      writeSessionCookie(res, result.token);
      res.status(200).json({ user: result.user });
    }),
  );

  router.post('/logout', (_req, res) => {
    res.cookie(SESSION_COOKIE_NAME, '', clearCookieOptions());
    res.status(200).json({ ok: true });
  });

  router.get('/me', requireAuth, (req, res) => {
    res.status(200).json({ user: req.user });
  });

  return router;
}
