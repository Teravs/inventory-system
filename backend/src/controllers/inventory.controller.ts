import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { InventoryStatus } from '../types/index.js';

export class InventoryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InventoryService.list(
        {
          page: req.query.page ? Number(req.query.page) : undefined,
          limit: req.query.limit ? Number(req.query.limit) : undefined,
          search: req.query.search as string,
          categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
          status: req.query.status as InventoryStatus
        },
        req.user!.role
      );
      sendSuccess(res, 'Inventory retrieved', result.items, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  static async getByAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await InventoryService.getByAssetNumber(req.params.assetNumber, req.user!.role);
      sendSuccess(res, 'Inventory detail retrieved', item);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 404);
      else next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { assetNumber, name, categoryId, purchaseMonth } = req.body;
      if (!assetNumber || !name || !categoryId || !purchaseMonth) {
        sendError(res, 'assetNumber, name, categoryId, and purchaseMonth are required.', 400);
        return;
      }

      const item = await InventoryService.create(
        req.body,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, 'Inventory created successfully', item, 201);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await InventoryService.update(
        req.params.assetNumber,
        req.body,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, 'Inventory updated successfully', item);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        sendError(res, 'Status is required.', 400);
        return;
      }
      const item = await InventoryService.changeStatus(
        req.params.assetNumber,
        status as InventoryStatus,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, `Inventory status updated to ${status}`, item);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await InventoryService.permanentDelete(
        req.params.assetNumber,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );
      sendSuccess(res, 'Inventory permanently deleted');
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }
}