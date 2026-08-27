import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from '../services/activity-logs.service.js';
import { sendSuccess } from '../utils/response.js';
import { ActivityAction } from '../types/index.js';

export class ActivityLogController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ActivityLogService.getLogs({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        action: req.query.action as ActivityAction,
        entityType: req.query.entityType as string
      });

      sendSuccess(res, 'Activity logs retrieved', result.logs, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }
}