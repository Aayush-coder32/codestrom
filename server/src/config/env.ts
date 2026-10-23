import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(10),
  MAX_AGENT_ITERATIONS: z.coerce.number().int().min(1).max(10).default(5)
});

export const env = schema.parse(process.env);
