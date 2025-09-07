import { createClient, RedisClientType } from 'redis';

class RedisConfig {
  private static instance: RedisConfig;
  private client: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig();
    }
    return RedisConfig.instance;
  }

  public async connect(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    await this.client.connect();
    return this.client;
  }

  public getClient(): RedisClientType | null {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      this.client = null;
    }
  }
}

export default RedisConfig;
