import { Prisma } from '~/prisma/generated/mysql';
import BaseController from '@src/controllers/BaseController';
import { Request, Response } from 'express';
import md5 from 'md5';

class RegisterController extends BaseController {
  public register = async (req: Request, res: Response) => {
    const fields = req.fields as Prisma.UserCreateInput;
    let checkUser = await globalThis.prisma.user.findUnique({
      where: {
        email: fields.email,
      },
    });
    if (checkUser) {
      throw new Error('Email đã tồn tại!');
    }

    checkUser = await globalThis.prisma.user.findUnique({
      where: {
        username: fields.username,
      },
    });
    if (checkUser) {
      throw new Error('Username đã tồn tại!');
    }

    // Hash password
    fields.password = md5(fields.password);

    const user = await globalThis.prisma.user.create({
      data: fields,
    });

    return res.json(
      this.success(user),
    );
  };
}

const controller = new RegisterController();

export const registerController = controller.register;