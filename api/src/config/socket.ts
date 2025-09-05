import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { MessageService } from '../services/message.service';
import { SessionService } from '../services/session.service';
import { UserModel } from '../models';

export const initializeSocket = async (server: any): Promise<SocketIOServer> => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'],
    allowEIO3: true
  });

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    
    await Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]);
    
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO Redis adapter configured for multi-instance support');
  } catch (error) {
    console.warn('Failed to configure Redis adapter for Socket.IO:', error);
    console.log('Socket.IO running in single-instance mode');
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

        io.to(`conversation_${conversationId}`).emit('message:new', message.toJSON());
        
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

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });

  return io;
};
