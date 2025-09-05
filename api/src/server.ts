import express from 'express';
import { Router, Request, Response } from 'express';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import { errorHandler, responseHandler } from './middleware';

const app = express();
const route = Router();
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.use(express.json());
    app.use(responseHandler);

    route.get('/', (req: Request, res: Response) => {
      res.success({ 
        message: 'Realtime Chat API',
        status: 'running'
      });
    });

    app.use('/auth', authRoutes);
    app.use('/', route);

    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} | ${NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

