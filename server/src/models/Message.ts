import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
  content: { type: String, required: true, maxlength: 100000 },
  status: { type: String, enum: ['complete', 'interrupted', 'error'], default: 'complete' },
  sources: [{ title: String, url: String }]
}, { timestamps: true });
messageSchema.index({ conversationId: 1, createdAt: 1 });
export const Message = model('Message', messageSchema);
