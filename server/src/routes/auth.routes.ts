import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { comparePassword, createAccessToken, createRefreshToken, hashPassword, revokeRefreshToken, rotateRefreshToken } from '../services/auth.service.js';
import { validateBody } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';
import { env } from '../config/env.js';

const credentials = z.object({ email: z.string().email().max(254), password: z.string().min(8).max(128) });
const register = credentials.extend({ displayName: z.string().trim().min(1).max(80) });
const cookieOptions = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none', path: '/api/auth' };
const router = Router();

function setRefreshCookie(res: import('express').Response, token: string) { res.cookie('nexus_refresh', token, { ...cookieOptions, maxAge: env.JWT_REFRESH_TTL_DAYS * 86400000 }); }
function publicUser(user: { _id: unknown; displayName: string; email: string }) { return { id: String(user._id), displayName: user.displayName, email: user.email }; }

router.post('/register', validateBody(register), async (req, res) => {
  const { email, password, displayName } = req.body;
  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) { res.status(409).json({ error: 'Unable to register with those credentials' }); return; }
  const user = await User.create({ email: email.toLowerCase(), displayName, passwordHash: await hashPassword(password) });
  const refresh = await createRefreshToken(String(user._id));
  setRefreshCookie(res, refresh);
  res.status(201).json({ accessToken: createAccessToken(String(user._id)), user: publicUser(user) });
});

router.post('/login', validateBody(credentials), async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash').exec();
  if (!user || !(await comparePassword(req.body.password, user.passwordHash))) { res.status(401).json({ error: 'Invalid email or password' }); return; }
  const refresh = await createRefreshToken(String(user._id));
  setRefreshCookie(res, refresh);
  res.json({ accessToken: createAccessToken(String(user._id)), user: publicUser(user) });
});

router.post('/refresh', async (req, res) => {
  const rotated = await rotateRefreshToken(req.cookies.nexus_refresh);
  if (!rotated) { res.status(401).json({ error: 'Refresh token expired or revoked' }); return; }
  setRefreshCookie(res, rotated.token);
  const user = await User.findById(rotated.userId).exec();
  if (!user) { res.status(401).json({ error: 'User not found' }); return; }
  res.json({ accessToken: createAccessToken(rotated.userId), user: publicUser(user) });
});

router.post('/logout', async (req, res) => { await revokeRefreshToken(req.cookies.nexus_refresh); res.clearCookie('nexus_refresh', cookieOptions); res.status(204).send(); });
router.get('/me', authenticate, async (req, res) => { const user = await User.findById(req.userId).exec(); if (!user) { res.status(404).json({ error: 'User not found' }); return; } res.json({ user: publicUser(user) }); });
export default router;
