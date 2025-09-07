import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { sessionAuth, updateLastSeen } from '../middleware';
import { UserCacheStrategy } from '../cache';

const router = Router();

router.use(sessionAuth);
router.use(updateLastSeen);

router.get('/', UserCacheStrategy.userList(), UserController.getUsers);
router.get('/me', UserCacheStrategy.currentUser(), UserController.getProfile);

export default router;
