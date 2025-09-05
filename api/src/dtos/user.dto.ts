import { UserResponse, PaginationMeta } from "../types/user.types";

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
    this.isOnline = user.isOnline; // Now comes from the virtual field
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

// DTO for paginated user list responses
export class PaginatedUserListResponseDTO {
  users: UserResponseDTO[];
  pagination: PaginationMeta;

  constructor(users: any[], pagination: PaginationMeta) {
    this.users = users.map(user => new UserResponseDTO(user));
    this.pagination = pagination;
  }

  toJSON() {
    return {
      users: this.users.map(user => user.toJSON()),
      pagination: this.pagination
    };
  }
}