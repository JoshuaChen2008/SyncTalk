import bcrypt from 'bcryptjs';

export const passwordHasher = {
  hash(password) {
    return bcrypt.hash(password, 12);
  },
  compare(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  },
};
