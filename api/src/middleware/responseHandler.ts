import { Request, Response, NextFunction } from 'express';
declare global {
  namespace Express {
    interface Response {
      success: <T>(data: T, message?: string, statusCode?: number) => void;
      created: <T>(data: T, message?: string) => void;
    }
  }
}

export const responseHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.success = <T>(data: T, message?: string, statusCode: number = 200): void => {
    const response = {
      success: true,
      data,
      ...(message && { message }),
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
  };

  res.created = <T>(data: T, message?: string): void => {
    res.success(data, message || 'Resource created successfully', 201);
  };
  
  next();
};
