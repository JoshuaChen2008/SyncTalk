import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createFriendsRouter(authService, friendsService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.post(
    '/requests',
    requireAuth,
    asyncRoute(async (req, res) => {
      const request = await friendsService.sendFriendRequest(req.user.id, req.body.receiverId);
      res.status(201).json({ request });
    }),
  );

  router.get(
    '/requests',
    requireAuth,
    asyncRoute(async (req, res) => {
      const requests = await friendsService.getFriendRequests(req.user.id);
      res.status(200).json(requests);
    }),
  );

  router.patch(
    '/requests/:requestId',
    requireAuth,
    asyncRoute(async (req, res) => {
      const result = await friendsService.respondToFriendRequest(
        req.user.id,
        req.params.requestId,
        req.body.action,
      );
      res.status(200).json(result);
    }),
  );

  router.get(
    '/',
    requireAuth,
    asyncRoute(async (req, res) => {
      const friends = await friendsService.getFriends(req.user.id);
      res.status(200).json({ friends });
    }),
  );

  router.delete(
    '/:friendId',
    requireAuth,
    asyncRoute(async (req, res) => {
      const result = await friendsService.removeFriend(req.user.id, req.params.friendId);
      res.status(200).json(result);
    }),
  );

  return router;
}
