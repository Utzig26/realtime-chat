import cluster from 'cluster';
import os from 'os';
import { startServer } from './server';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master process ${process.pid} is running | starting ${numCPUs} worker processes...`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();


  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} just died F. Reviving it...`);
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is live`);
  });

} else {
  console.log(`Worker process ${process.pid} started`);
  
  startServer().catch((error) => {
    console.error('Error starting server in worker:', error);
    process.exit(1);
  });
}

