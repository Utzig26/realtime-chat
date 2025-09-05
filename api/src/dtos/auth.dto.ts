import { AuthResponse } from '../types/auth.types';
import { UserResponseDTO } from './user.dto';

export class AuthResponseDTO implements AuthResponse {
  user: UserResponseDTO;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };

  constructor(user: any, tokens: any) {
    this.user = new UserResponseDTO(user);
    this.tokens = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    };
  }

  toJSON(): AuthResponse {
    return {
      user: this.user.toJSON(),
      tokens: this.tokens
    };
  }
}
