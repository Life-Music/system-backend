/**
 * Setup express server.
 */
import morgan from 'morgan';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import logger from 'jet-logger';
import fileUpload from 'express-fileupload';

import 'express-async-errors';

import BaseRouter from '@src/routes/';

import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import { NodeEnvs } from '@src/constants/misc';
import { RouteError } from '@src/other/classes';
import { PrismaClient } from '../prisma/generated/mysql';
import cors from 'cors';
import { RedisClientType, createClient } from 'redis';
import s3Client from '@src/services/S3Client';
import bodyParser from 'body-parser';
const redisClient: RedisClientType = createClient({
  url: EnvVars.Redis.Uri,
});

redisClient.on('error', err => console.log('Redis Client Error', err))
  .connect();

// **** Variables **** //

const app = express();

const prisma = new PrismaClient();
globalThis.prisma = prisma;
globalThis.redis = redisClient;
globalThis.s3Client = s3Client;

// **** Setup **** //

// Basic middleware
app.use(bodyParser.json({
  // Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
  verify: function (req, res, buf) {
    // @ts-ignore
    var url = req.originalUrl;
    if (url.startsWith('/api/v1/webhook')) {
      // @ts-ignore
      req.rawBody = buf.toString();
    }
  }
}));
app.use(cors());
app.use(fileUpload());
app.use((req, res, next) => {
  res.header('cross-origin-resource-policy', 'cross-origin');
  next();
});
app.use(express.urlencoded({ extended: true }));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use('', BaseRouter);


// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  res.status(status).json({ error: err.message }).end();
});


// **** Export default **** //

export default app;
