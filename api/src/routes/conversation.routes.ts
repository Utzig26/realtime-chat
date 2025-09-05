import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { authenticate } from '../middleware';

const router = Router();

router.use(authenticate);

router.post('/', ConversationController.createConversation);

router.get('/', ConversationController.getUserConversations);

router.get('/:id', ConversationController.getConversationById);

export default router;
