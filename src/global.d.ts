/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import BaseRequest from './requests/BaseRequest';
import { PrismaClient, User } from '../prisma/generated/mysql';
import { RedisClientType } from 'redis';

export { };

export declare type RouterOptions = {
  path: string,
  method?: METHOD,
  middleware?: Array<RequestHandler>,
  controller?: RequestHandler,
  request?: BaseRequest['validation'],
  children?: Array<RouterOptions>,
}

declare module 'express' {
  export interface Request {
    database?: PrismaClient;
    fields?: Record<string, any>;
    userInfo?: User
    redis?: RedisClientType;
  }

}