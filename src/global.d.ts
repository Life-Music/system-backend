/* eslint-disable no-var */
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

declare global {
  var prisma: PrismaClient;
  var redis: RedisClientType;
}


declare module 'express' {
  export interface Request {
    fields?: Record<string, any>;
    userInfo?: User
  }

}