import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createAdapter as createClusterAdapter } from '@socket.io/cluster-adapter';
import { createClient } from 'redis';
import cluster from 'cluster';
import { MessageService } from '../services/message.service';
import { SessionService } from '../services/session.service';
import { UserModel, ConversationModel } from '../models';
import { MessageNotification, UnreadCountUpdate } from '../types/message.types';

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
      
      // Test Redis connection
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
    console.log(`User ${socket.user.username} connected`);
    
    socket.join(`user_${socket.user.id}`);
    console.log(`User ${socket.user.username} joined personal notification room`);

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.username} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.user.username} left conversation ${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; text: string }) => {
      try {
        const { conversationId, text } = data;
        
        if (!conversationId || !text?.trim()) {
          socket.emit('message:error', { error: 'Invalid message data' });
          return;
        }

        const message = await MessageService.sendMessage(
          conversationId, 
          socket.user.id, 
          text
        );

        if (io) {
          io.to(`conversation_${conversationId}`).emit('message:new', message.toJSON());
        }
        
        const updatedConversation = await ConversationModel.findById(conversationId);
        if (updatedConversation) {
          const otherParticipants = updatedConversation.participants.filter(
            (participantId: any) => participantId.toString() !== socket.user.id
          );
          
          otherParticipants.forEach((participantId: any) => {
            const participantIdStr = participantId.toString();
            const unreadCount = updatedConversation.unreadMessages.get(participantIdStr) || 0;
            
            const notification: MessageNotification = {
              senderId: socket.user.id,
              senderName: socket.user.name,
              senderUsername: socket.user.username,
              conversationId: conversationId,
              messageId: message.id,
              text: text,
              timestamp: new Date().toISOString()
            };
            
            if (io) {
              io.to(`user_${participantIdStr}`).emit('notification:new_message', notification);
              const unreadUpdate: UnreadCountUpdate = {
                conversationId: conversationId,
                unreadCount: unreadCount
              };
              io.to(`user_${participantIdStr}`).emit('conversation:unread_update', unreadUpdate);
            }
            
            console.log(`Notification and unread count (${unreadCount}) sent to user ${participantIdStr} for message from ${socket.user.username}`);
          });
        }
        
        console.log(`Message sent in conversation ${conversationId} by ${socket.user.username}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    socket.on('message:read', async (data: { messageId: string; conversationId: string }) => {
      try {
        const { messageId, conversationId } = data;
        
        if (!messageId || !conversationId) {
          socket.emit('message:error', { error: 'Invalid read receipt data' });
          return;
        }

        await MessageService.markMessageAsRead(messageId, socket.user.id);

        socket.to(`conversation_${conversationId}`).emit('message:read_receipt', {
          messageId,
          readBy: socket.user.id,
          readAt: new Date()
        });
        
        console.log(`Message ${messageId} marked as read by ${socket.user.username}`);
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('message:error', { error: 'Failed to mark message as read' });
      }
    });

    socket.on('conversation:mark_as_read', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        
        if (!conversationId) {
          socket.emit('message:error', { error: 'Invalid conversation ID' });
          return;
        }

        const result = await MessageService.markConversationMessagesAsRead(conversationId, socket.user.id);

        const unreadUpdate: UnreadCountUpdate = {
          conversationId: conversationId,
          unreadCount: 0
        };
        socket.emit('conversation:unread_update', unreadUpdate);
        
        console.log(`${result.markedCount} messages marked as read in conversation ${conversationId} by ${socket.user.username}`);
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

// Simple function to get socket instance
export const getSocketInstance = () => io;
