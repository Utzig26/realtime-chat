import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { configurePassport } from './config/passport';
import { getSocketInstance, initializeSocket } from './config/socket';
import RedisConfig from './config/redis';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import conversationRoutes from './routes/conversation.routes';
import messageRoutes from './routes/message.routes';
import { errorHandler, responseHandler } from './middleware';
import { setupSwagger } from './config/swagger';
import cluster from 'cluster';
import { setupMaster, setupWorker } from '@socket.io/sticky';
import { setupPrimary, createAdapter } from '@socket.io/cluster-adapter';

const PORT = process.env.PORT || 3000;

const numCPUs = require("os").cpus().length;
const app = express();

async function buildApp() {
    await connectDatabase();
    await RedisConfig.getInstance().connect();
    
    configurePassport();
    
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'], 
      credentials: true,
    }));
    
    app.use(express.json());
    app.use(cookieParser());
    app.use(responseHandler);

    if (process.env.NODE_ENV !== 'production') {
        setupSwagger(app);
    }

    app.get('/', (req, res) => {
      res.json({ 
        message: 'Ok!', 
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    });

    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/conversations', conversationRoutes);
    app.use('/conversations', messageRoutes);

    app.use(errorHandler);

    console.log('App built');
    const httpServer = createServer(app);
    
    httpServer.headersTimeout = 60000;
    httpServer.keepAliveTimeout = 30000;
    httpServer.requestTimeout = 120000;
    httpServer.timeout = 120000;
    
    return httpServer;
};

if (cluster.isPrimary) {
  const httpServer = createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  setupPrimary();

  httpServer.listen(PORT, () => {
    console.log(`MASTER Listening on port ${PORT}`);
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    setTimeout(() => {
      console.log(`WORKER ${worker.process.pid} is down, restarting...`);
      cluster.fork();
    }, 1000);
  });

  cluster.on('online', (worker) => {
    console.log(`WORKER ${worker.process.pid} is up`);
  });
} else {
  (async () => {
    const httpServer = await buildApp();

    await initializeSocket(httpServer);
    const io = getSocketInstance();
    if (!io) {
      process.exit(1);
    }

    io.adapter(createAdapter());

    setupWorker(io);
  })();  
}
