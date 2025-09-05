import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // TODO: Add logger
  console.error('Error:', {
    message: error.message,
    statusCode,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode
    }
  });
};
