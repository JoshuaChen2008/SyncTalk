import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createChatRouter(authService, chatService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.get(
    '/token',
    requireAuth,
    asyncRoute((req, res) => {
      const token = chatService.createToken(req.user);
      res.status(200).json(token);
    }),
  );

  router.get(
    '/channel/:friendId',
    requireAuth,
    asyncRoute(async (req, res) => {
      const channel = await chatService.getChannel(req.user.id, req.params.friendId);
      res.status(200).json(channel);
    }),
  );

  return router;
}
