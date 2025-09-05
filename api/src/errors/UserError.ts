import { AppError } from './AppError';

export class UserNotFoundError extends AppError {
  constructor(message: string = 'User not found') {
    super(message, 404);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(message: string = 'User already exists') {
    super(message, 409);
  }
}

export class InvalidUserDataError extends AppError {
  constructor(message: string = 'Invalid user data') {
    super(message, 400);
  }
}

export class UserUpdateError extends AppError {
  constructor(message: string = 'Failed to update user') {
    super(message, 400);
  }
}
