import { UserModel } from '../models';
import { UserNotFoundError, InvalidUserDataError } from '../errors';
import { UpdateUserRequest, GetUsersByActivityRequest } from '../types/user.types';
import { UserResponseDTO, UserListResponseDTO } from '../dtos/user.dto';

export class UserService {
  static async getAllUsers(): Promise<UserListResponseDTO> {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return new UserListResponseDTO(users);
  }

  static async getUserById(userId: string): Promise<UserResponseDTO> {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    return new UserResponseDTO(user);
  }

  static async getCurrentUser(userId: string): Promise<UserResponseDTO> {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    return new UserResponseDTO(user);
  }

  static async updateUser(userId: string, updateData: UpdateUserRequest): Promise<UserResponseDTO> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    return new UserResponseDTO(user);
  }


  static async userExists(userId: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    return user !== null;
  }
}
