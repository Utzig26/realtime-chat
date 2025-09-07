import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware';
import { getUserByIdSchema, getUsersWithPaginationSchema } from '../schemas/user.schema';
import { User } from '../types/user.types';

export class UserController {

  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = getUsersWithPaginationSchema.parse(req.query);
    const paginatedUserListDTO = await UserService.getUsers(validatedQuery);
    res.success(paginatedUserListDTO.toJSON(), 'Users retrieved successfully');
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as User).id.toString();
    const userDTO = await UserService.getCurrentUser(userId);

    res.success(userDTO.toJSON(), 'Profile retrieved successfully');
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const validatedParams = getUserByIdSchema.parse(req.params);
    const userDTO = await UserService.getUserById(validatedParams.id);

    res.success(userDTO.toJSON(), 'User retrieved successfully');
  });

}
