import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { AuthError } from '../errors';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(new AuthError('Authentication failed'));
    }
    
    if (!user) {
      return next(new AuthError('Invalid or expired token'));
    }
    
    req.user = user;
    next();
  })(req, res, next);
};
