import { UserModel } from '../models';
import { UserNotFoundError, InvalidUserDataError } from '../errors';
import { UpdateUserRequest, GetUsersByActivityRequest, PaginationParams } from '../types/user.types';
import { UserResponseDTO, UserListResponseDTO, PaginatedUserListResponseDTO } from '../dtos/user.dto';

export class UserService {

  static async getUsers(params: PaginationParams): Promise<PaginatedUserListResponseDTO> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const totalUsers = await UserModel.countDocuments();
    const userDocs = await UserModel.aggregate([
      {
        $sort: {
          isOnline: -1, 
          createdAt: -1 
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    const users = userDocs.map(doc => new UserModel(doc));

    const totalPages = Math.ceil(totalUsers / limit);

    return new PaginatedUserListResponseDTO(users, {
      page,
      limit,
      totalUsers,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
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
