import { randomBytes } from 'crypto';
import RedisConfig from '../config/redis';
import { UserModel } from '../models';

export interface SessionData {
  userId: string;
  username: string;
  name: string;
  createdAt: Date;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateSessionOptions {
  userAgent?: string;
  ipAddress?: string;
}

export class SessionService {
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private static readonly SESSION_TTL = 7 * 24 * 60 * 60;
  private static readonly MAX_SESSIONS_PER_USER = 5;

  static async createSession(
    userId: string, 
    options: CreateSessionOptions = {}
  ): Promise<string> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const sessionId = randomBytes(32).toString('hex');
      
      const user = await UserModel.findById(userId).select('-passwordHash');
      if (!user) {
        throw new Error('User not found');
      }

      const sessionData: SessionData = {
        userId: user._id.toString(),
        username: user.username,
        name: user.name,
        createdAt: new Date(),
        lastActivity: new Date(),
        ...(options.userAgent && { userAgent: options.userAgent }),
        ...(options.ipAddress && { ipAddress: options.ipAddress })
      };

      const sessionKey = this.SESSION_PREFIX + sessionId;
      await redis.setEx(sessionKey, this.SESSION_TTL, JSON.stringify(sessionData));

      const userSessionsKey = this.USER_SESSIONS_PREFIX + userId;
      await redis.sAdd(userSessionsKey, sessionId);
      await redis.expire(userSessionsKey, this.SESSION_TTL);

      await this.cleanupUserSessions(userId);

      return sessionId;
    } finally { }
  }

  static async getSession(sessionId: string): Promise<SessionData | null> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const sessionData = await redis.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }

      const parsed = JSON.parse(sessionData) as SessionData;
      
      parsed.lastActivity = new Date();
      await redis.setEx(sessionKey, this.SESSION_TTL, JSON.stringify(parsed));
      
      return parsed;
    } finally { }
  }

  static async updateSessionActivity(sessionId: string): Promise<void> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const sessionData = await redis.get(sessionKey);
      
      if (sessionData) {
        const parsed = JSON.parse(sessionData) as SessionData;
        parsed.lastActivity = new Date();
        await redis.setEx(sessionKey, this.SESSION_TTL, JSON.stringify(parsed));
      }
    } finally { }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const sessionData = await redis.get(sessionKey);
      
      if (sessionData) {
        const parsed = JSON.parse(sessionData) as SessionData;
        
        const userSessionsKey = this.USER_SESSIONS_PREFIX + parsed.userId;
        await redis.sRem(userSessionsKey, sessionId);
        
        await redis.del(sessionKey);
      }
    } finally { }
  }

  static async deleteAllUserSessions(userId: string): Promise<void> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const userSessionsKey = this.USER_SESSIONS_PREFIX + userId;
      const sessionIds = await redis.sMembers(userSessionsKey);
      
      if (sessionIds.length > 0) {
        const sessionKeys = sessionIds.map(id => this.SESSION_PREFIX + id);
        await redis.del(sessionKeys);
        
        await redis.del(userSessionsKey);
      }
    } finally { }
  }

  static async getUserSessions(userId: string): Promise<SessionData[]> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const userSessionsKey = this.USER_SESSIONS_PREFIX + userId;
      const sessionIds = await redis.sMembers(userSessionsKey);
      
      const sessions: SessionData[] = [];
      
      for (const sessionId of sessionIds) {
        const sessionData = await this.getSession(sessionId);
        if (sessionData) {
          sessions.push(sessionData);
        }
      }
      
      return sessions;
    } finally { }
  }

  private static async cleanupUserSessions(userId: string): Promise<void> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const userSessionsKey = this.USER_SESSIONS_PREFIX + userId;
      const sessionIds = await redis.sMembers(userSessionsKey);
      
      if (sessionIds.length > this.MAX_SESSIONS_PER_USER) {
        const sessions: { id: string; data: SessionData }[] = [];
        
        for (const sessionId of sessionIds) {
          const sessionData = await this.getSession(sessionId);
          if (sessionData) {
            sessions.push({ id: sessionId, data: sessionData });
          }
        }
        
        sessions.sort((a, b) => 
          new Date(b.data.lastActivity).getTime() - new Date(a.data.lastActivity).getTime()
        );
        
        const sessionsToRemove = sessions.slice(this.MAX_SESSIONS_PER_USER);
        for (const session of sessionsToRemove) {
          await this.deleteSession(session.id);
        }
      }
    } finally { }
  }

  static async validateSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await this.getSession(sessionId);
    
    if (!sessionData) {
      return null;
    }

    const user = await UserModel.findById(sessionData.userId);
    if (!user) {
      await this.deleteSession(sessionId);
      return null;
    }

    return sessionData;
  }

  static async extendSession(sessionId: string): Promise<void> {
    const redis = await RedisConfig.getInstance().connect();
    
    try {
      const sessionKey = this.SESSION_PREFIX + sessionId;
      const exists = await redis.exists(sessionKey);
      
      if (exists) {
        await redis.expire(sessionKey, this.SESSION_TTL);
        
        const sessionData = await redis.get(sessionKey);
        if (sessionData) {
          const parsed = JSON.parse(sessionData) as SessionData;
          const userSessionsKey = this.USER_SESSIONS_PREFIX + parsed.userId;
          await redis.expire(userSessionsKey, this.SESSION_TTL);
        }
      }
    } finally { }
  }
}
