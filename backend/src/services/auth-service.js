import { passwordHasher as defaultPasswordHasher } from './password-hasher.js';
import { createTokenService } from './token-service.js';
import { createUserRepository } from './user-repository.js';
import { createHttpError } from '../utils/http-error.js';

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function serializeUser(user) {
  return {
    id: String(user.id ?? user._id),
    username: user.username,
    email: user.email,
  };
}

function validateRegistration({ username, email, password }) {
  if (!username) {
    throw createHttpError(400, 'Username is required');
  }

  if (!email) {
    throw createHttpError(400, 'Email is required');
  }

  if (!password || password.length < 8) {
    throw createHttpError(400, 'Password must be at least 8 characters');
  }
}

function mapDuplicateUserError(error) {
  if (error.code !== 11000) {
    throw error;
  }

  if (error.keyPattern?.username) {
    throw createHttpError(409, 'Username is already taken');
  }

  throw createHttpError(409, 'Email is already registered');
}

function invalidCredentialsError() {
  return createHttpError(401, 'Invalid email/username or password');
}

export function createAuthService({
  userRepository = createUserRepository(),
  passwordHasher = defaultPasswordHasher,
  tokenService = createTokenService(),
} = {}) {
  return {
    async register(input) {
      const username = normalizeText(input.username);
      const email = normalizeEmail(input.email);
      const password = String(input.password ?? '');

      validateRegistration({ username, email, password });

      const passwordHash = await passwordHasher.hash(password);

      try {
        const createdUser = await userRepository.createUser({
          username,
          email,
          passwordHash,
        });
        const user = serializeUser(createdUser);

        return {
          token: tokenService.sign(user.id),
          user,
        };
      } catch (error) {
        mapDuplicateUserError(error);
      }
    },

    async login(input) {
      const identifier = normalizeText(input.identifier);
      const lookupIdentifier = identifier.includes('@') ? normalizeEmail(identifier) : identifier;
      const password = String(input.password ?? '');

      if (!identifier || !password) {
        throw invalidCredentialsError();
      }

      const userWithPassword = await userRepository.findByEmailOrUsername(lookupIdentifier);

      if (!userWithPassword) {
        throw invalidCredentialsError();
      }

      const isPasswordValid = await passwordHasher.compare(password, userWithPassword.passwordHash);

      if (!isPasswordValid) {
        throw invalidCredentialsError();
      }

      const user = serializeUser(userWithPassword);

      return {
        token: tokenService.sign(user.id),
        user,
      };
    },

    async getCurrentUser(token) {
      let payload;

      try {
        payload = tokenService.verify(token);
      } catch {
        throw createHttpError(401, 'Authentication required');
      }

      const user = await userRepository.findById(payload.userId);

      if (!user) {
        throw createHttpError(401, 'Authentication required');
      }

      return serializeUser(user);
    },
  };
}

export const authService = createAuthService();
