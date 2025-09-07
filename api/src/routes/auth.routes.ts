import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { sessionAuth } from '../middleware/sessionAuth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post('/logout', sessionAuth, AuthController.logout);

export default router;