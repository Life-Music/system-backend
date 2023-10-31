import { User } from '@prisma/client';
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
  try {
    const data = jwt.verify(token, EnvVars.Jwt.Secret);
    if (!data) return next();
  }
  catch (e) {
    throw new Error('Vui lòng đăng xuất và thử lại!');
  }
  throw new Error('Vui lòng đăng xuất và thử lại!');
};


export const setUserInfo: RequestHandler = (req: Request, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, EnvVars.Jwt.Secret);
    if (typeof payload !== 'string') {
      req.userInfo = payload.data as User;
      return next();
    }
  }
  catch (e) {
    return next();
  }
  next();
};