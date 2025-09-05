import { Request, Response, NextFunction } from 'express';
import { CacheService } from './service';

export interface CacheOptions {
  key: string;
  ttl?: number;
  skip?: (req: Request) => boolean;
}

export class CacheMiddleware {
  private static cacheService = CacheService.getInstance();

  static cache(options: CacheOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (options.skip && options.skip(req)) return next();

        const cachedData = await this.cacheService.get(options.key);
        
        if (cachedData) {
          // Cache hit
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', options.key);
          return res.success(cachedData);
        }

        // Cache miss - capture response data
        const originalSuccess = (res as any).success;
        let responseData: any = null;

        (res as any).success = function(data: any) {
          responseData = data;
          return originalSuccess.call(this, data);
        };

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', options.key);

        next();

        res.on('finish', async () => {
          if (responseData && res.statusCode === 200) {
            try {
              await this.cacheService.set(options.key, responseData, options.ttl);
            } catch (error) {
              console.error('Failed to cache response:', error);
            }
          }
        });

      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  static invalidate(patterns: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const originalSuccess = (res as any).success;

      (res as any).success = function(data: any) {
        if (res.statusCode === 200) {
          patterns.forEach(async (pattern) => {
            try {
              await CacheMiddleware.cacheService.delPattern(pattern);
            } catch (error) {
              console.error('Failed to invalidate cache:', error);
            }
          });
        }
        return originalSuccess.call(this, data);
      };

      next();
    };
  }
}
