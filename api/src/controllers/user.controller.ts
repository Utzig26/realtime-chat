import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware';
import { updateUserSchema, getUserByIdSchema } from '../schemas/user.schema';

export class UserController {

  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const userListDTO = await UserService.getAllUsers();

    res.success(userListDTO.toJSON(), 'Users retrieved successfully');
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id.toString();
    const userDTO = await UserService.getCurrentUser(userId);

    res.success(userDTO.toJSON(), 'Profile retrieved successfully');
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const validatedParams = getUserByIdSchema.parse(req.params);
    const userDTO = await UserService.getUserById(validatedParams.id);

    res.success(userDTO.toJSON(), 'User retrieved successfully');
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)._id.toString();
    const validatedUpdateData = updateUserSchema.parse(req.body);

    const userDTO = await UserService.updateUser(userId, validatedUpdateData);

    res.success(userDTO.toJSON(), 'Profile updated successfully');
  });
}
