import { Prisma } from '~/prisma/generated/mysql';
import BaseController from '@src/controllers/BaseController';
import { Request, Response } from 'express';
import md5 from 'md5';

class RegisterController extends BaseController {
  public register = async (req: Request, res: Response) => {
    const fields = req.fields as Prisma.UserCreateInput;
    if (req.database) {
      let checkUser = await req.database.user.findUnique({
        where: {
          email: fields.email,
        },
      });
      if (checkUser) {
        throw new Error('Email đã tồn tại!');
      }

      checkUser = await req.database.user.findUnique({
        where: {
          username: fields.username,
        },
      });
      if (checkUser) {
        throw new Error('Username đã tồn tại!');
      }

      // Hash password
      fields.password = md5(fields.password);

      const user = await req.database.user.create({
        data: fields,
      });

      return res.json(
        this.success(user),
      );
    }

    return res.json(
      this.success({}),
    );
  };
}

const controller = new RegisterController();

export const registerController = controller.register;