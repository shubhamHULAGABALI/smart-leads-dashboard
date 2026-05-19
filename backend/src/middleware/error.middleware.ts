import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.util';

// ─── Validation Error Handler ──────────────────────────────────────────────

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg as string,
    }));
    sendError(res, 'Validation failed', 422, errors);
    return;
  }
  next();
};

// ─── 404 Handler ───────────────────────────────────────────────────────────

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};

// ─── Global Error Handler ──────────────────────────────────────────────────

export const errorHandler = (
  err: Error & { code?: number; name: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[ERROR]', err.name, err.message);

  if (err.name === 'MongoServerError' && err.code === 11000) {
    sendError(res, 'A record with this value already exists', 409);
    return;
  }

  if (err.name === 'CastError') {
    sendError(res, 'Invalid resource identifier', 400);
    return;
  }

  if (err.name === 'ValidationError') {
    sendError(res, err.message, 422);
    return;
  }

  sendError(res, 'Internal server error', 500);
};
