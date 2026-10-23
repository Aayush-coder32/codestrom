import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error?.statusCode ?? (error?.name === 'ValidationError' ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : error.message });
};
