import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema(
  {
    userAId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userBId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

friendshipSchema.index({ userAId: 1, userBId: 1 }, { unique: true });

export const Friendship = mongoose.models.Friendship || mongoose.model('Friendship', friendshipSchema);
