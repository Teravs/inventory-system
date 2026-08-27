import { Request, Response, NextFunction } from 'express';
import { Role } from '../types/index.js';
import { sendError } from '../utils/response.js';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Forbidden: You do not have permission to perform this action.', 403);
      return;
    }

    next();
  };
};