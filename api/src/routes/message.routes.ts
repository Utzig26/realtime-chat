import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { sessionAuth, updateLastSeen } from '../middleware';

const router = Router();

router.use(sessionAuth);
router.use(updateLastSeen);

router.get('/:id/messages', MessageController.getMessages);
router.put('/:conversationId/messages/read', MessageController.markConversationMessagesAsRead);

export default router;
