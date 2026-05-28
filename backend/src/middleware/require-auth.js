import { SESSION_COOKIE_NAME } from '../routes/auth.js';
import { createHttpError } from '../utils/http-error.js';

export function createRequireAuth(authService) {
  return async function requireAuth(req, _res, next) {
    try {
      const token = req.cookies[SESSION_COOKIE_NAME];

      if (!token) {
        throw createHttpError(401, 'Authentication required');
      }

      req.user = await authService.getCurrentUser(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}
