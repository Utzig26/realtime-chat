import { Request, Response } from 'express';
import { createUserSchema, loginSchema } from "../schemas/user.schema";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const validatedCreateUserSchema = createUserSchema.parse(req.body);
    const authResponse = await AuthService.register(validatedCreateUserSchema);
    
    res.created(authResponse.toJSON(), 'User registered successfully');
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedLoginSchema = loginSchema.parse(req.body);
    const authResponse = await AuthService.login(validatedLoginSchema);
    
    res.success(authResponse.toJSON(), 'Login successful');
  });
}