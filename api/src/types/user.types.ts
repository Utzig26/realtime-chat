export interface User {
  id: string;
  name: string;
  username: string;
  createdAt: Date;
  lastSeen?: Date;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  createdAt: Date;
  lastSeen?: Date;
  avatarUrl?: string;
  isOnline: boolean;
}

export interface UpdateUserRequest {
  name?: string | undefined;
  avatarUrl?: string | undefined;
}

export interface GetUsersByActivityRequest {
  online?: boolean;
}
