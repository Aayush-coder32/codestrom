import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { streamReply } from '../services/chat.service.js';

const router = Router();
router.post('/stream', authenticate, async (req, res) => {
  const parsed = z.object({ conversationId: z.string().optional(), content: z.string().trim().min(1).max(20000) }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Message content is required' }); return; }
  let conversation = parsed.data.conversationId ? await Conversation.findOne({ _id: parsed.data.conversationId, ownerId: req.userId }) : null;
  if (!conversation) conversation = await Conversation.create({ ownerId: req.userId, title: parsed.data.content.slice(0, 60), model: 'configured' });
  await Message.create({ ownerId: req.userId, conversationId: conversation._id, role: 'user', content: parsed.data.content });
  const history = await Message.find({ conversationId: conversation._id, role: { $in: ['user', 'assistant'] } }).sort({ createdAt: 1 }).limit(40).lean();
  res.status(200).set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Conversation-Id': String(conversation._id) });
  res.flushHeaders();
  const send = (event: string, data: unknown) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  send('message_start', { conversationId: String(conversation._id) });
  const controller = new AbortController();
  req.on('close', () => controller.abort());
  let content = '';
  try {
    for await (const delta of streamReply(history.map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content })), controller.signal)) { content += delta; send('content_delta', { delta }); }
    await Message.create({ ownerId: req.userId, conversationId: conversation._id, role: 'assistant', content });
    await Conversation.updateOne({ _id: conversation._id }, { lastMessageAt: new Date() });
    send('message_complete', { content });
  } catch (error) {
    if (!controller.signal.aborted) send('error', { error: error instanceof Error ? error.message : 'Generation failed' });
  } finally { res.end(); }
});
export default router;
