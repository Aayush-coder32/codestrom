import { Schema, model } from 'mongoose';

const documentSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalName: { type: String, required: true },
  storageKey: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  pageCount: Number,
  processingStatus: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
  chunkCount: { type: Number, default: 0 },
  extractedText: { type: String, select: false }
}, { timestamps: true });
export const Document = model('Document', documentSchema);
