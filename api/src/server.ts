import express from 'express';
import { Router, Request, Response } from 'express';
import { connectDatabase } from './config/database';

const app = express();
const route = Router();
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} | ${NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

app.use(express.json());

route.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Realtime Chat API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.use('/', route);

startServer();

