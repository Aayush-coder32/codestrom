import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  authProvider: { type: String, default: 'local' },
  preferences: { theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' } }
}, { timestamps: true });

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const User = model('User', userSchema);
