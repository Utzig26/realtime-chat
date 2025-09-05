import { UserResponse } from "../types/user.types";

export class UserResponseDTO  implements UserResponse {
  id: string;
  name: string;
  username: string;
  createdAt: Date;
  lastSeen?: Date;
  avatarUrl?: string;
  isOnline: boolean;

  constructor(user: any) {
    this.id = user._id?.toString() || user.id;
    this.name = user.name;
    this.username = user.username;
    this.createdAt = user.createdAt;
    this.lastSeen = user.lastSeen;
    this.avatarUrl = user.avatarUrl;
    this.isOnline = user.isOnline || false;
  }

  toJSON(): UserResponse {
    const response: UserResponse = {
      id: this.id,
      name: this.name,
      username: this.username,
      createdAt: this.createdAt,
      isOnline: this.isOnline
    };

    if (this.lastSeen !== undefined) {
      response.lastSeen = this.lastSeen;
    }
    
    if (this.avatarUrl !== undefined) {
      response.avatarUrl = this.avatarUrl;
    }

    return response;
  }
}