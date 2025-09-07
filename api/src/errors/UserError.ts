import { AppError } from './AppError';

export class UserNotFoundError extends AppError {
  constructor(message: string = 'User not found') {
    super(message, 404);
  }
}

export class InvalidUserDataError extends AppError {
  constructor(message: string = 'Invalid user data') {
    super(message, 400);
  }
}
