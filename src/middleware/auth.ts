import EnvVars from '@src/constants/EnvVars';
import { RequestHandler, Request } from 'express';
import jwt from 'jsonwebtoken';

export const onlyAuth: RequestHandler = (req: Request, res, next) => {
  const invalid = () => {
    throw new Error('Tính năng này chỉ dành cho người dùng đã đăng nhập!');
  };
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return invalid();
  }
  const data = jwt.verify(token, EnvVars.Jwt.Secret);
  if (data) {
    next();
  }
  return;
};


export const onlyGuest: RequestHandler = (req: Request, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return next();
  const data = jwt.verify(token, EnvVars.Jwt.Secret);
  if (!data) return next();
  throw new Error('Tính năng này chỉ dành cho nguười chưa được xác thực!');
};