import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

export class HealthController {
  static check(_req: Request, res: Response) {
    sendSuccess(res, 'System operational', {
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
  }
}