import { Schema, model } from 'mongoose';

const conversationSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 120, default: 'New chat' },
  model: { type: String, required: true },
  lastMessageAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
conversationSchema.index({ ownerId: 1, lastMessageAt: -1 });
export const Conversation = model('Conversation', conversationSchema);
