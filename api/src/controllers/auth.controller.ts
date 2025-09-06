import { Request, Response } from 'express';
import { createUserSchema } from "../schemas/user.schema";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware";
import { setSessionCookie, clearSessionCookie } from "../middleware/sessionAuth";
import { loginSchema } from "../schemas/auth.schema";
import { AuthenticatedRequest } from '../types/session.types';
import { UserCacheStrategy } from '../cache';
import { getSocketInstance } from '../config/socket';

export class AuthController {

  static register = asyncHandler(async (req: Request, res: Response) => {
    const validatedCreateUserSchema = createUserSchema.parse(req.body);
    
    const sessionOptions: any = {};
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.socket.remoteAddress;
    
    if (userAgent) sessionOptions.userAgent = userAgent;
    if (ipAddress) sessionOptions.ipAddress = ipAddress;
    
    const { user, sessionId } = await AuthService.register(validatedCreateUserSchema, sessionOptions);

    await UserCacheStrategy.invalidateUserCache();

    const socketInstance = getSocketInstance();
    if (socketInstance) {
      socketInstance.emit('users:refresh');
    }

    setSessionCookie(res, sessionId);
    res.created({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt
      }
    }, 'User registered successfully');
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedLoginSchema = loginSchema.parse(req.body);
    
    const sessionOptions: any = {};
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.socket.remoteAddress;
    
    if (userAgent) sessionOptions.userAgent = userAgent;
    if (ipAddress) sessionOptions.ipAddress = ipAddress;
    
    const { user, sessionId } = await AuthService.login(validatedLoginSchema, sessionOptions);
    
    setSessionCookie(res, sessionId);
    res.success({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
      }
    }, 'Login successful');
  });

  static extendSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.extendSession(req.sessionId);
    res.success({}, 'Session extended successfully');
  });

  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.logout(req.sessionId);
    clearSessionCookie(res);
    res.success({}, 'Logged out successfully');
  });

  static logoutAllSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.logoutAllSessions(req.user._id.toString());
    clearSessionCookie(res);
    res.success({}, 'All sessions logged out successfully');
  });

  static getUserSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const sessions = await AuthService.getUserSessions(req.user._id.toString());
    res.success({ sessions }, 'User sessions retrieved successfully');
  });
}