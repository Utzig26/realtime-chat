import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware';
import { UserCacheStrategy } from '../cache';

const router = Router();

router.use(authenticate);

router.get('/', UserCacheStrategy.userList(), UserController.getUsers);

router.get('/me', UserCacheStrategy.currentUser(), UserController.getProfile);

router.get('/:id', UserCacheStrategy.userById(), UserController.getUserById);

router.put('/me', UserCacheStrategy.invalidateUser(), UserController.updateProfile);

export default router;
