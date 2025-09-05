import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { sessionAuth } from '../middleware';

const router = Router();

router.use(sessionAuth);

router.post('/', ConversationController.createConversation);

router.get('/', ConversationController.getUserConversations);

router.get('/:id', ConversationController.getConversationById);

export default router;
