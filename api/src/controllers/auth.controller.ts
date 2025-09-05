import { Request, Response } from 'express';
import { createUserSchema, loginSchema } from "../schemas/user.schema";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try{
    const validatedCreateUserSchema = createUserSchema.parse(req.body);
    const result = await AuthService.register(validatedCreateUserSchema);
    console.log(result);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error:any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedLoginSchema = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedLoginSchema);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}