import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token.js';
import { sendError } from '../utils/response.js';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { UserStatus } from '../types/index.js';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies[ENV.COOKIE_NAME];

  if (!token) {
    sendError(res, 'Authentication required. Please log in.', 401);
    return;
  }

  try {
    const decoded = verifyToken(token);
    
    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true, status: true }
    });

    if (!user || user.status === UserStatus.INACTIVE) {
      res.clearCookie(ENV.COOKIE_NAME);
      sendError(res, 'Account deactivated or does not exist.', 401);
      return;
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    next();
  } catch {
    res.clearCookie(ENV.COOKIE_NAME);
    sendError(res, 'Invalid or expired session token.', 401);
  }
};