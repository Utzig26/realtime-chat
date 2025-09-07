import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createAdapter as createClusterAdapter } from '@socket.io/cluster-adapter';
import { createClient } from 'redis';
import cluster from 'cluster';
import { MessageService } from '../services/message.service';
import { SessionService } from '../services/session.service';
import { UserModel, ConversationModel } from '../models';
import { MessageNotification, UnreadCountUpdate, ConversationNotification } from '../types/message.types';
import { ConversationService } from '../services';

let io: SocketIOServer | null = null;

export const initializeSocket = async (server: any): Promise<SocketIOServer> => {
  const workerId = process.env.WORKER_ID || 'unknown';
  
  io = new SocketIOServer(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  });

  if (cluster.isWorker) {
    console.log(`🔗 Socket.IO instance created for worker ${workerId} (adapter will be set in cluster)`);
  } else {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    try {
      const pubClient = createClient({ 
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis max retry attempts reached');
              return new Error('Max retry attempts reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });
      const subClient = pubClient.duplicate();
      
      await Promise.all([
        pubClient.connect(),
        subClient.connect()
      ]);
      
      io.adapter(createAdapter(pubClient, subClient));
      console.log('🔗 Socket.IO Redis adapter configured for multi-instance support');
      
      await pubClient.ping();
      console.log('✅ Redis connection verified');
    } catch (error) {
      console.warn('⚠️ Failed to configure Redis adapter for Socket.IO:', error);
      console.log('🔧 Socket.IO running in single-instance mode');
    }
  }
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
        console.log('Socket auth failed: No session ID found in cookies');
        console.log('Available cookies:', cookies);
        return next(new Error('Session authentication required'));
      }

      const sessionData = await SessionService.validateSession(sessionId);
      
      if (!sessionData) {
        console.log('Socket auth failed: Invalid or expired session');
        return next(new Error('Invalid session'));
      }

      const user = await UserModel.findById(sessionData.userId).select('-passwordHash');
      
      if (!user) {
        console.log('Socket auth failed: User not found');
        return next(new Error('User not found'));
      }

      await SessionService.updateSessionActivity(sessionId);
      
      socket.user = {
        id: user._id.toString(),
        username: user.username,
        name: user.name
      };
      
      socket.sessionId = sessionId;
      
      console.log(`Socket auth successful for user: ${user.username}`);
      next();
    } catch (error) {
      console.log('Socket auth failed: Exception:', error);
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
