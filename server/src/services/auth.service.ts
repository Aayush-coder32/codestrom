import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';

export function createAccessToken(userId: string): string {
  return jwt.sign({}, env.JWT_ACCESS_SECRET, { subject: userId, audience: 'nexus-client', issuer: 'nexus-api', expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'] });
}

export async function createRefreshToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(48).toString('hex');
  await RefreshToken.create({ userId, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 86400000) });
  return raw;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function rotateRefreshToken(raw: string): Promise<{ userId: string; token: string } | null> {
  const existing = await RefreshToken.findOne({ tokenHash: hashToken(raw), revokedAt: null }).exec();
  if (!existing || existing.expiresAt <= new Date()) return null;
  existing.revokedAt = new Date();
  await existing.save();
  return { userId: String(existing.userId), token: await createRefreshToken(String(existing.userId)) };
}

export async function revokeRefreshToken(raw?: string): Promise<void> {
  if (raw) await RefreshToken.updateOne({ tokenHash: hashToken(raw), revokedAt: null }, { revokedAt: new Date() });
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
