import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createProfileRouter(authService, profileService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.get(
    '/me',
    requireAuth,
    asyncRoute(async (req, res) => {
      const profile = await profileService.getMyProfile(req.user.id);
      res.status(200).json({ profile });
    }),
  );

  router.patch(
    '/me',
    requireAuth,
    asyncRoute(async (req, res) => {
      const profile = await profileService.updateMyProfile(req.user.id, req.body);
      res.status(200).json({ profile });
    }),
  );

  router.get(
    '/:userId',
    requireAuth,
    asyncRoute(async (req, res) => {
      const profile = await profileService.getPublicProfile(req.user.id, req.params.userId);
      res.status(200).json({ profile });
    }),
  );

  return router;
}
