import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createNotificationsRouter(authService, notificationsService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.get(
    '/',
    requireAuth,
    asyncRoute(async (req, res) => {
      const result = await notificationsService.getNotifications(req.user.id);
      res.status(200).json(result);
    }),
  );

  router.patch(
    '/:notificationId/read',
    requireAuth,
    asyncRoute(async (req, res) => {
      const notification = await notificationsService.markNotificationAsRead(
        req.user.id,
        req.params.notificationId,
      );
      res.status(200).json({ notification });
    }),
  );

  return router;
}
