import express from 'express';
import { Application } from 'express';

type ServerConfig = {
  port: number,
}

type Route = (app: Application) => void;
export async function initServer(testingRoutes: Route[], { port }: ServerConfig) { 
  const app = express();
  app.use(express.json());
  testingRoutes.forEach(f => f(app));

  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });

  return async () => {
    await new Promise((res) => {
      try {
        server.close(() => {
          console.log('HTTP server closed');
          res(0);
        });
      } catch (e) {
        console.error('Error while closing server', e);
        res(1);
      }
    });
  };
}

