import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { CategoryStatus } from '../types/index.js';

export class CategoryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const onlyActive = req.query.active === 'true';
      const categories = await CategoryService.listCategories(onlyActive);
      sendSuccess(res, 'Categories retrieved', categories);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) {
        sendError(res, 'Category name is required', 400);
        return;
      }
      const category = await CategoryService.createCategory(name.trim());
      sendSuccess(res, 'Category created successfully', category, 201);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) {
        sendError(res, 'Category name is required', 400);
        return;
      }
      const category = await CategoryService.updateCategory(Number(req.params.id), name.trim());
      sendSuccess(res, 'Category updated successfully', category);
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
      const category = await CategoryService.setCategoryStatus(Number(req.params.id), status as CategoryStatus);
      sendSuccess(res, `Category status changed to ${status}`, category);
    } catch (err: unknown) {
      if (err instanceof Error) sendError(res, err.message, 400);
      else next(err);
    }
  }
}