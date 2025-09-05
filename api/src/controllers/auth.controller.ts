import { Request, Response } from 'express';
import { createUserSchema } from "../schemas/user.schema";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware";
import { setAuthCookies, clearAuthCookies } from "../middleware";
import { loginSchema } from "../schemas/auth.schema";
import { AuthError } from '../errors';

export class AuthController {

  static register = asyncHandler(async (req: Request, res: Response) => {
    const validatedCreateUserSchema = createUserSchema.parse(req.body);
    const authResponse = await AuthService.register(validatedCreateUserSchema);

    setAuthCookies(res, authResponse.tokens.accessToken, authResponse.tokens.refreshToken);
    res.created(authResponse.toJSON(), 'User registered successfully');
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedLoginSchema = loginSchema.parse(req.body);
    const authResponse = await AuthService.login(validatedLoginSchema);
    
   setAuthCookies(res, authResponse.tokens.accessToken, authResponse.tokens.refreshToken);
   res.success(authResponse.toJSON(), 'Login successful');
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AuthError('User is not logged in');
    }

    const authResponse = await AuthService.refreshToken(refreshToken);
    
    setAuthCookies(res, authResponse.tokens.accessToken, authResponse.tokens.refreshToken);
    res.success(authResponse.toJSON(), 'Token refreshed successfully');
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // if you are already logged out... Lie and clear the already cleared cookies
    clearAuthCookies(res);
    
    res.success({}, 'Logged out successfully');
  });
}