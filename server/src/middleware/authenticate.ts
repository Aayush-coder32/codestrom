import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

declare global {
  namespace Express { interface Request { userId?: string } }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) { res.status(401).json({ error: 'Authentication required' }); return; }
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { audience: 'nexus-client', issuer: 'nexus-api' });
    if (typeof payload === 'string' || !payload.sub) throw new Error('Invalid token');
    req.userId = payload.sub;
    next();
  } catch { res.status(401).json({ error: 'Invalid or expired access token' }); }
}
