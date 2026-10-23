import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { env } from '../config/env.js';

const router = Router();
router.use(authenticate);
router.get('/', async (req, res) => res.json({ conversations: await Conversation.find({ ownerId: req.userId }).sort({ lastMessageAt: -1 }).limit(100).lean() }));
router.post('/', async (req, res) => res.status(201).json({ conversation: await Conversation.create({ ownerId: req.userId, title: 'New chat', model: env.OPENAI_MODEL }) }));
router.get('/:id/messages', async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, ownerId: req.userId });
  if (!conversation) { res.status(404).json({ error: 'Conversation not found' }); return; }
  res.json({ messages: await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).limit(200).lean() });
});
router.patch('/:id', async (req, res) => {
  const parsed = z.object({ title: z.string().trim().min(1).max(120) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid title' }); return; }
  const conversation = await Conversation.findOneAndUpdate({ _id: req.params.id, ownerId: req.userId }, { title: parsed.data.title }, { new: true });
  if (!conversation) { res.status(404).json({ error: 'Conversation not found' }); return; }
  res.json({ conversation });
});
router.delete('/:id', async (req, res) => { await Message.deleteMany({ conversationId: req.params.id, ownerId: req.userId }); const deleted = await Conversation.deleteOne({ _id: req.params.id, ownerId: req.userId }); if (!deleted.deletedCount) { res.status(404).json({ error: 'Conversation not found' }); return; } res.status(204).send(); });
export default router;
