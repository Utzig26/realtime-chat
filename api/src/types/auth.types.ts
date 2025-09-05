import { UserResponse } from "./user.types";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  sessionId: string;
}