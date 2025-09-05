import { z } from 'zod';

// Common validation patterns
export const objectIdSchema = z.string()
  .min(1, 'ID is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const paginationLimitSchema = z.string()
  .optional()
  .transform((val) => val ? parseInt(val, 10) : 20)
  .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100');

export const messageTextSchema = z.string()
  .min(1, 'Message text is required')
  .max(2000, 'Message cannot exceed 2000 characters')
  .trim();
