import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  guildId: string;
  cheese: number; // The currency
  lastDaily: Date;
  lastWork: Date;
  lastChatReward: Date;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  cheese: { type: Number, default: 0 },
  lastDaily: { type: Date, default: new Date(0) },
  lastWork: { type: Date, default: new Date(0) },
  lastChatReward: { type: Date, default: new Date(0) },
});

userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', userSchema);
