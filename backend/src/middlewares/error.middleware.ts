import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled Application Error:', err);

  sendError(
    res,
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected internal server error occurred.' 
      : err.message,
    500
  );
};