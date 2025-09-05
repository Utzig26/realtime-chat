import { UserResponse } from "./user.types";

export interface LoginRequest {
  username: string;
  password: string;
}
export interface AuthResponse {
  user: UserResponse;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}