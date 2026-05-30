import { User } from '../models/user.js';

export function createUserRepository({ userModel = User } = {}) {
  return {
    createUser(user) {
      return userModel.create(user);
    },
    findByEmailOrUsername(identifier) {
      return userModel
        .findOne({
          $or: [{ email: identifier }, { username: identifier }],
        })
        .select('+passwordHash');
    },
    findById(userId) {
      return userModel.findById(userId);
    },
    updateProfile(userId, profile) {
      return userModel.findByIdAndUpdate(userId, profile, {
        new: true,
        runValidators: true,
      });
    },
  };
}
