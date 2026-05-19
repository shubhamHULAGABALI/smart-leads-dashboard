import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';

export const register = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role?: string;
    };
    const result = await authService.register({ name, email, password, role: role as never });
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    if (message.includes('already exists')) {
      sendError(res, message, 409);
    } else {
      next(err);
    }
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login({ email, password });
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    if (message.includes('Invalid email or password')) {
      sendError(res, message, 401);
    } else {
      next(err);
    }
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) { sendError(res, 'Unauthorized', 401); return; }

    const user = await authService.getMe(req.user.id);
    if (!user) { sendError(res, 'User not found', 404); return; }

    sendSuccess(res, user, 'Profile fetched');
  } catch (err) {
    next(err);
  }
};
