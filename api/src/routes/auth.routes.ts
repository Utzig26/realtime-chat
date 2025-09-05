import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { sessionAuth } from '../middleware/sessionAuth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post('/extend-session', sessionAuth, AuthController.extendSession);
router.post('/logout', sessionAuth, AuthController.logout);
router.post('/logout-all', sessionAuth, AuthController.logoutAllSessions);
router.get('/sessions', sessionAuth, AuthController.getUserSessions);

export default router;