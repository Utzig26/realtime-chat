import bcrypt from 'bcryptjs';
import { UserModel } from "../models";
import { CreateUserRequest } from "../types/user.types";
import { ConflictError, AuthError, UserNotFoundError } from '../errors';
import { LoginRequest } from '../types/auth.types';
import { SessionService, CreateSessionOptions } from './session.service';
import { SessionResponse } from '../types/session.types';

const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

export class AuthService {
  static async register(
    createUserRequest: CreateUserRequest, 
    sessionOptions: CreateSessionOptions = {}
  ): Promise<{ user: any; sessionId: string }> {
    const { name, username, password } = createUserRequest;
    
    if (await UserModel.userExists(username)) throw new ConflictError('Username already exists');

    const passwordHash = await this.hashPassword(password);

    const user = await UserModel.create({
      name: name,
      username: username,
      passwordHash: passwordHash,
    });

    const sessionId = await SessionService.createSession(user._id.toString(), sessionOptions);

    return { user, sessionId };
  }

  static async login(
    loginRequest: LoginRequest, 
    sessionOptions: CreateSessionOptions = {}
  ): Promise<{ user: any; sessionId: string }> {
    const { username, password } = loginRequest;
    
    const user = await UserModel.findOneWithPassword({ username: username.toLowerCase() });
    if (!user) {
      throw new AuthError('Invalid username or password');
    }

    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthError('Invalid username or password');
    }

    user.lastSeen = new Date();
    await user.save();

    const sessionId = await SessionService.createSession(user._id.toString(), sessionOptions);

    return { user, sessionId };
  }

  static async logout(sessionId: string): Promise<void> {
    const sessionData = await SessionService.validateSession(sessionId);
    
    await SessionService.deleteSession(sessionId);
    
    if (sessionData && sessionData.userId) {
      await UserModel.findByIdAndUpdate(
        sessionData.userId,
        { lastSeen: new Date() },
        { new: false }
      ).exec().catch(error => {
        console.error('Failed to update lastSeen on logout:', error);
      });
    }
  }

  static async logoutAllSessions(userId: string): Promise<void> {
    await SessionService.deleteAllUserSessions(userId);
    
    await UserModel.findByIdAndUpdate(
      userId,
      { lastSeen: new Date() },
      { new: false }
    ).exec().catch(error => {
      console.error('Failed to update lastSeen on logout all sessions:', error);
    });
  }

  static async getUserSessions(userId: string): Promise<SessionResponse[]> {
    const sessions = await SessionService.getUserSessions(userId);
    
    return sessions.map(session => ({
      sessionId: '', 
      user: {
        id: session.userId,
        username: session.username,
        name: session.name
      },
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    }));
  }

  static async extendSession(sessionId: string): Promise<void> {
    await SessionService.extendSession(sessionId);
  }

  // private methods
  
  private static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

}

