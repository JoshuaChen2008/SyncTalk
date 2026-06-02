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
    findDiscoverableUsers(userId) {
      return userModel
        .find({
          _id: { $ne: userId },
          nativeLanguage: { $ne: '' },
          targetLanguage: { $ne: '' },
          languageLevel: { $ne: '' },
          learningGoal: { $ne: '' },
          timezone: { $ne: '' },
        })
        .sort({ username: 1 });
    },
    searchDiscoverableUsers(userId, query) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedQuery, 'i');

      return userModel
        .find({
          _id: { $ne: userId },
          nativeLanguage: { $ne: '' },
          targetLanguage: { $ne: '' },
          languageLevel: { $ne: '' },
          learningGoal: { $ne: '' },
          timezone: { $ne: '' },
          $or: [
            { username: pattern },
            { nativeLanguage: pattern },
            { targetLanguage: pattern },
            { bio: pattern },
          ],
        })
        .sort({ username: 1 });
    },
    updateProfile(userId, profile) {
      return userModel.findByIdAndUpdate(userId, profile, {
        new: true,
        runValidators: true,
      });
    },
  };
}
