import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createCallRouter(authService, callService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.get(
    '/token',
    requireAuth,
    asyncRoute((req, res) => {
      const token = callService.createToken(req.user);
      res.status(200).json(token);
    }),
  );

  router.get(
    '/session/:friendId',
    requireAuth,
    asyncRoute(async (req, res) => {
      const session = await callService.getSession(req.user.id, req.params.friendId);
      res.status(200).json(session);
    }),
  );

  router.post(
    '/session/:friendId/ring',
    requireAuth,
    asyncRoute(async (req, res) => {
      const session = await callService.getRingingSession(req.user.id, req.params.friendId);
      res.status(201).json(session);
    }),
  );

  return router;
}
