import RedisConfig from '../config/redis';
import { RedisClientType } from 'redis';

export class CacheService {
  private static instance: CacheService;
  private redis: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async getRedisClient(): Promise<RedisClientType> {
    if (!this.redis) {
      const redisConfig = RedisConfig.getInstance();
      this.redis = await redisConfig.connect();
    }
    return this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getRedisClient();
      const cached = await client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const client = await this.getRedisClient();
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await client.setEx(key, ttl, serialized);
      } else {
        await client.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    try {
      const client = await this.getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(keys);
      }
      
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const client = await this.getRedisClient();
      await client.ping();
      return true;
    } catch (error) {
      console.error('Cache health check failed:', error);
      return false;
    }
  }
}
