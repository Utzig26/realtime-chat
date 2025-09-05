import { AuthResponse } from '../types/auth.types';
import { UserResponseDTO } from './user.dto';

export class AuthResponseDTO implements AuthResponse {
  user: UserResponseDTO;
  sessionId: string;

  constructor(user: any, sessionId: string) {
    this.user = new UserResponseDTO(user);
    this.sessionId = sessionId;
  }

  toJSON(): AuthResponse {
    return {
      user: this.user.toJSON(),
      sessionId: this.sessionId
    };
  }
}
