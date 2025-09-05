import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { UserModel } from '../models';
import { AuthError } from '../errors';

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      sessionData?: any;
    }
  }
}

export const sessionAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (!sessionId) {
      return next(new AuthError('No session found'));
    }

    const sessionData = await SessionService.validateSession(sessionId);
    
    if (!sessionData) {
      res.clearCookie('sessionId');
      return next(new AuthError('Invalid or expired session'));
    }

    const user = await UserModel.findById(sessionData.userId).select('-passwordHash');
    
    if (!user) {
      await SessionService.deleteSession(sessionId);
      res.clearCookie('sessionId');
      return next(new AuthError('User not found'));
    }

    await SessionService.updateSessionActivity(sessionId);

    req.sessionId = sessionId;
    req.sessionData = sessionData;
    req.user = user;
    
    next();
  } catch (error) {
    return next(new AuthError('Session validation failed'));
  }
};

export const setSessionCookie = (res: Response, sessionId: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
  });
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie('sessionId');
};

export const requireAuth = sessionAuth;

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (!sessionId) return next(); 

    const sessionData = await SessionService.validateSession(sessionId);
    
    if (!sessionData) {
      res.clearCookie('sessionId');
      return next(); 
    }

    const user = await UserModel.findById(sessionData.userId).select('-passwordHash');
    
    if (!user) {
      await SessionService.deleteSession(sessionId);
      res.clearCookie('sessionId');
      return next();
    }

    await SessionService.updateSessionActivity(sessionId);

    req.sessionId = sessionId;
    req.sessionData = sessionData;
    req.user = user;
    
    next();
  } catch (error) {
    next();
  }
};
