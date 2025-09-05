import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    const validationErrors = error.issues.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    res.status(statusCode).json({
      success: false,
      error: {
        message,
        details: validationErrors
      }
    });
    return;
  }

  else if (error instanceof AppError) {
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
      message
    }
  });
};
