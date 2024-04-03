/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, NextFunction, Response } from 'express';
import Redis from 'ioredis';

// Replace these values with your actual cloud-based Redis information
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT as unknown as number;
const redisPassword = process.env.REDIS_PASSWORD;

const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
});

export const redisMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (req as any).redis = redisClient;
  next();
};
