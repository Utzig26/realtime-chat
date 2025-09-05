import { UserResponse } from "../types/user.types";

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
export class UserResponseDTO implements UserResponse {
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
    this.isOnline = this.calculateIsOnline(user.lastSeen);
  }

  private calculateIsOnline(lastSeen?: Date): boolean {
    if (!lastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - FIVE_MINUTES_IN_MS);
    return lastSeen > fiveMinutesAgo;
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

// DTO for user list responses
export class UserListResponseDTO {
  users: UserResponseDTO[];

  constructor(users: any[]) {
    this.users = users.map(user => new UserResponseDTO(user));
  }

  toJSON() {
    return {
      users: this.users.map(user => user.toJSON())
    };
  }
}