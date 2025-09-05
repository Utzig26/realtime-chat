import { z } from 'zod';
import { CreateUserRequest } from '../types/user.types';
import { LoginRequest } from '../types/auth.types';

export const createUserSchema: z.ZodType<CreateUserRequest> = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
    .trim(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters')
});

export const loginSchema: z.ZodType<LoginRequest> = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(30, 'Username cannot exceed 30 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password cannot exceed 100 characters'),
});
