import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { UserRole, UserStatus } from '../types/index.js';

export class UserController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.listUsers();
      sendSuccess(res, 'Users retrieved', users);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(Number(req.params.id));
      sendSuccess(res, 'User found', user);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, username, password, role } = req.body;
      if (!name || !username || !password || !role) {
        sendError(res, 'All fields (name, username, password, role) are required.', 400);
        return;
      }
      const user = await UserService.createUser(
        { name, username, passwordPlain: password, role: role as UserRole },
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, 'User created successfully', user, 201);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await UserService.updateUser(
        Number(req.params.id),
        req.body,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, 'User updated successfully', updated);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        sendError(res, 'Status is required', 400);
        return;
      }
      const updated = await UserService.changeUserStatus(
        Number(req.params.id),
        status as UserStatus,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, `User status changed to ${status}`, updated);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async setRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      if (!role) {
        sendError(res, 'Role is required', 400);
        return;
      }
      const updated = await UserService.changeUserRole(
        Number(req.params.id),
        role as UserRole,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, `User role changed to ${role}`, updated);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUserPermanent(
        Number(req.params.id),
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, 'User permanently deleted');
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }
}