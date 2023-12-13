/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import BaseRequest from './requests/BaseRequest';
import type { PrismaClient, User } from '../prisma/generated/mysql';
import type { RedisClientType } from 'redis';
import type { S3Client } from '@aws-sdk/client-s3';

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
  var s3Client: S3Client;
}


declare module 'express' {
  export interface Request {
    fields?: Record<string, any>;
    query: Record<string, any>;
    userInfo?: User
  }

}