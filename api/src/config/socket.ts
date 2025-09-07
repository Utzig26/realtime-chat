import { Server } from 'socket.io';
import { MessageService } from '../services/message.service';
import { SessionService } from '../services/session.service';
import { ConversationModel } from '../models';
import { MessageNotification, UnreadCountUpdate } from '../types/message.types';
import { ConversationService, UserService } from '../services';

let io: Server | null = null;

export const initializeSocket = async (httpServer: any): Promise<Server> => {  
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    transports: ['websocket'],
    pingTimeout: 120000,
    pingInterval: 30000,
    connectTimeout: 60000, 
    upgradeTimeout: 30000 
  });

  io.use(async (socket: any, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      let sessionId = null;
      
      if (cookies) {
        const cookieMatch = cookies.match(/sessionId=([^;]+)/);
        if (cookieMatch) {
          sessionId = cookieMatch[1];
        }
      }
      
      if (!sessionId) {
        return next(new Error('Session authentication required'));
      }

      const sessionData = await SessionService.validateSession(sessionId);
      
      if (!sessionData) {
        return next(new Error('Invalid session'));
      }

      const user = await UserService.getUserById(sessionData.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      await SessionService.updateSessionActivity(sessionId);
      
      socket.user = {
        id: user.id.toString(),
        username: user.username,
        name: user.name
      };
      
      socket.sessionId = sessionId;
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: any) => {

    socket.join(`user_${socket.user.id}`);

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; text: string }) => {
      try {
        const { conversationId, text } = data;
        
        if (!text?.trim()) {
          socket.emit('message:error', { error: 'Invalid message data' });
          return;
        }

        const message = await MessageService.sendMessage(
          conversationId, 
          socket.user.id, 
          text
        );

        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
          socket.emit('message:error', { error: 'Conversation not found' });
          return;
        }

        const otherParticipant = conversation.participants.find(
          (participantId: any) => participantId.toString() !== socket.user.id
        );

        if (otherParticipant) { await ConversationService.updateLastMessageAt(conversationId, otherParticipant.toString()) }

        const notification: MessageNotification = {
          senderId: socket.user.id,
          senderName: socket.user.name,
          senderUsername: socket.user.username,
          conversationId: conversationId,
          messageId: message.id,
          text: text,
          timestamp: new Date().toISOString()
        };
        
        if(io){
          io.to(`conversation_${conversationId}`).emit('message:new', message.toJSON());
          io.to(`user_${otherParticipant?.toString()}`).emit('notification:new_message', notification);
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    socket.on('conversation:mark_as_read', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        
        if (!conversationId) {
          socket.emit('message:error', { error: 'Invalid conversation ID' });
          return;
        }

        await MessageService.markConversationMessagesAsRead(conversationId, socket.user.id);

        const unreadUpdate: UnreadCountUpdate = {
          conversationId: conversationId,
          unreadCount: 0
        };

        socket.emit('conversation:unread_update', unreadUpdate);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
        socket.emit('message:error', { error: 'Failed to mark conversation as read' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });

  return io;
};

export const getSocketInstance = () => io;
