import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models';
import { AuthenticatedRequest } from '../types/session.types';
import { User } from '../types/user.types';

export const updateLastSeen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      const userId = (req.user as User).id;
      const now = new Date();
      

      UserModel.findByIdAndUpdate(
        userId,
        { lastSeen: now },
        { new: false } 
      ).exec().catch(error => {
        console.error('Failed to update lastSeen:', error);
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in updateLastSeen middleware:', error);
    next();
  }
};
