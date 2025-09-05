import { Request, Response } from 'express';
import { createUserSchema, loginSchema } from "../schemas/user.schema";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const validatedCreateUserSchema = createUserSchema.parse(req.body);
    const result = await AuthService.register(validatedCreateUserSchema);
    
    res.created(result, 'User registered successfully');
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const validatedLoginSchema = loginSchema.parse(req.body);
    const result = await AuthService.login(validatedLoginSchema);
    
    res.success(result, 'Login successful');
  });
}