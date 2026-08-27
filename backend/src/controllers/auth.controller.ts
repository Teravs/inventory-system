import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        sendError(res, 'Username and password are required.', 400);
        return;
      }

      const { token, user } = await AuthService.login(username, password);

      res.cookie(ENV.COOKIE_NAME, token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      sendSuccess(res, 'Login successful', { user });
    } catch (err: unknown) {
      if (err instanceof Error) {
        sendError(res, err.message, 401);
      } else {
        next(err);
      }
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(ENV.COOKIE_NAME, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    sendSuccess(res, 'Logged out successfully');
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const user = await AuthService.getProfile(req.user.id);
      sendSuccess(res, 'Current user profile loaded', { user });
    } catch (err) {
      next(err);
    }
  }
}