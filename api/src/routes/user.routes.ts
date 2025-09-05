import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware';
import { z } from 'zod';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Schema for profile update
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional()
});

// GET /api/users - Get all users (protected)
router.get('/', UserController.getUsers);

// GET /api/users/me - Get current user profile (protected)
router.get('/me', UserController.getProfile);

// GET /api/users/:id - Get user by ID (protected)
router.get('/:id', UserController.getUserById);


export default router;
