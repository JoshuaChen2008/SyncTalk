import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export function createTokenService({ secret = env.jwtSecret } = {}) {
  return {
    sign(userId) {
      return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
    },
    verify(token) {
      const payload = jwt.verify(token, secret);
      return { userId: payload.sub };
    },
  };
}
