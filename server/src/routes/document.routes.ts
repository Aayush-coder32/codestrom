import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate.js';
import { Document } from '../models/Document.js';
import { env } from '../config/env.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'application/pdf') });
router.use(authenticate);
router.get('/', async (req, res) => res.json({ documents: await Document.find({ ownerId: req.userId }).select('-extractedText').sort({ createdAt: -1 }).lean() }));
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: 'A PDF file is required' }); return; }
  const document = await Document.create({ ownerId: req.userId, originalName: req.file.originalname, storageKey: `memory:${Date.now()}`, mimeType: req.file.mimetype, sizeBytes: req.file.size, extractedText: req.file.buffer.toString('utf8'), processingStatus: 'ready', chunkCount: 1 });
  res.status(201).json({ document: document.toObject({ transform: (_doc, ret) => { delete ret.extractedText; return ret; } }) });
});
router.delete('/:id', async (req, res) => { const result = await Document.deleteOne({ _id: req.params.id, ownerId: req.userId }); if (!result.deletedCount) { res.status(404).json({ error: 'Document not found' }); return; } res.status(204).send(); });
export default router;
