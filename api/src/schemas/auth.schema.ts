import z from "zod";
import { LoginRequest } from "../types/auth.types";

export const loginSchema: z.ZodType<LoginRequest> = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(30, 'Username cannot exceed 30 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password cannot exceed 100 characters'),
});
