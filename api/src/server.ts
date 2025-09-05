import express from 'express';
import { Router, Request, Response } from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { configurePassport } from './config/passport';
import { initializeSocket } from './config/socket';
import RedisConfig from './config/redis';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import conversationRoutes from './routes/conversation.routes';
import messageRoutes from './routes/message.routes';
import { errorHandler, responseHandler } from './middleware';

const app = express();
const server = createServer(app);
const route = Router();
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

export const startServer = async () => {
  try {
    await connectDatabase();
    await RedisConfig.getInstance().connect();
    
    configurePassport();
    
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'], 
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Cookie']
    }));
    
    app.use(express.json());
    app.use(cookieParser());
    app.use(responseHandler);

    route.get('/', (req: Request, res: Response) => {
      res.success({ 
        message: 'Realtime Chat API',
        status: 'running'
      });
    });

    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/conversations', conversationRoutes);
    app.use('/', messageRoutes);
    app.use('/', route);

    app.use(errorHandler);

    // Initialize Socket.IO
    await initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} | ${NODE_ENV}`);
      console.log('Socket.IO server initialized');
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly (not imported by cluster)
if (require.main === module) {
  startServer();
}

