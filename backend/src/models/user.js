import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    nativeLanguage: {
      type: String,
      default: '',
    },
    targetLanguage: {
      type: String,
      default: '',
    },
    languageLevel: {
      type: String,
      default: '',
    },
    learningGoal: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
