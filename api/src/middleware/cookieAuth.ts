import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models';
import { AuthError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Cookie-based authentication middleware
 * Reads JWT from HTTP-only cookies instead of Authorization header
 */
export const cookieAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie instead of Authorization header
    const token = req.cookies.accessToken;
    
    if (!token) {
      return next(new AuthError('No access token provided'));
    }

    // Verify token
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    if (!payload.sub) {
      return next(new AuthError('Invalid token payload'));
    }

    // Find user
    const user = await UserModel.findById(payload.sub).select('-passwordHash');
    
    if (!user) {
      return next(new AuthError('User not found'));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AuthError('Invalid or expired token'));
    }
    return next(error);
  }
};

/**
 * Utility to set secure HTTP-only cookies
 */
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,           // Not accessible via JavaScript
    secure: isProduction,     // HTTPS only in production
    sameSite: 'strict',       // CSRF protection
    maxAge: 15 * 60 * 1000,  // 15 minutes
    path: '/'
  });

  // Refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,           // Not accessible via JavaScript
    secure: isProduction,     // HTTPS only in production
    sameSite: 'strict',       // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

/**
 * Utility to clear auth cookies
 */
export const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
