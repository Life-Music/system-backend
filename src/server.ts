/**
 * Setup express server.
 */
import morgan from 'morgan';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import logger from 'jet-logger';

import 'express-async-errors';

import BaseRouter from '@src/routes/';

import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import { NodeEnvs } from '@src/constants/misc';
import { RouteError } from '@src/other/classes';
import { PrismaClient } from '@prisma/client';


// **** Variables **** //

const app = express();


// **** Setup **** //

// Basic middleware
app.use((req: Request, res, next) => {
  const prisma = new PrismaClient();
  req.database = prisma;
  next();
});
app.use(express.json());
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


app.use((req: Request, res, next) => {
  if (req.database) {
    req.database.$disconnect().then(() => {
      next();
    });
  }
});

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
