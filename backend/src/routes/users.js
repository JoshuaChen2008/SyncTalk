import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createUsersRouter(authService, usersService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.get(
    '/recommendations',
    requireAuth,
    asyncRoute(async (req, res) => {
      const users = await usersService.getRecommendations(req.user.id);
      res.status(200).json({ users });
    }),
  );

  router.get(
    '/search',
    requireAuth,
    asyncRoute(async (req, res) => {
      const users = await usersService.searchUsers(req.user.id, req.query.query ?? '');
      res.status(200).json({ users });
    }),
  );

  return router;
}
