import { Request } from 'express';
import { CacheMiddleware } from '../middleware';
import { User } from '../../types/user.types';

const TTL = {
  USER_BY_ID: 300,
  USER_LIST: 60,
  CURRENT_USER: 300,
}

export class UserCacheStrategy {
  static userById() {
    return (req: Request, res: any, next: any) => {
      const userId = req.params.id;
      const middleware = CacheMiddleware.cache({
        key: `user:${userId}`,
        ttl: TTL.USER_BY_ID,
        skip: (req: Request) => req.method !== 'GET'
      });
      return middleware(req, res, next);
    };
  }

  static userList() {
    return (req: Request, res: any, next: any) => {
      const { page = 1, limit = 10 } = req.query;
      const middleware = CacheMiddleware.cache({
        key: `users:list:${page}:${limit}`,
        ttl: TTL.USER_LIST,
        skip: (req: Request) => req.method !== 'GET'
      });
      return middleware(req, res, next);
    };
  }

  static currentUser() {
    return (req: Request, res: any, next: any) => {
      const userId = (req.user as User).id.toString();
      const middleware = CacheMiddleware.cache({
        key: `user:current:${userId}`,
        ttl: TTL.CURRENT_USER,
        skip: (req: Request) => req.method !== 'GET'
      });
      return middleware(req, res, next);
    };
  }

  static invalidateUser() {
    return CacheMiddleware.invalidate(['user:*', 'users:list:*']);
  }
}
