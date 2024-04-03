import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import helmet from 'helmet';
import router from '../routes';
import cookieParser from 'cookie-parser';
// import { redisMiddleware } from './redis';

function createServer() {
  const app = express();

  // middleware
  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:4200',
    })
  );

  // Parse incoming requests with urlencoded payloads
  app.use(bodyParser.urlencoded({ extended: false }));

  // Parse incoming requests with JSON payloads
  app.use(bodyParser.json());

  app.use(cookieParser());

  // app.use(helmet());

  // redis middleware
  // app.use(redisMiddleware);

  // mount api routes
  app.use('/api', router);

  return app;
}

export default createServer;

// offers
// satement on hold
// to confirm
// i agree
