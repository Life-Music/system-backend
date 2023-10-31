import { Prisma } from '@prisma/client';
import BaseController from '@src/controllers/BaseController';
import { Request, Response } from 'express';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import EnvVars from '@src/constants/EnvVars';

class LoginController extends BaseController {
  public login = async (req: Request, res: Response) => {
    const fields = req.fields as Prisma.UserCreateInput;
    if (req.database) {

      // Hash password
      fields.password = md5(fields.password);

      const checkUser = await req.database.user.findFirst({
        where: {
          OR:
            [
              {
                username: fields.username,
              },
              {
                email: fields.username,
              },
            ]
          ,
          password: fields.password,
        },
      });
      if (!checkUser) {
        throw new Error('Sai tên đăng nhập hoặc mật khẩu');
      }

      const token = jwt.sign({
        data: checkUser,
      }, EnvVars.Jwt.Secret, { expiresIn: parseInt(EnvVars.Jwt.Exp) });


      return res.json(
        this.success({
          user: checkUser,
          token,
        }),
      );

    }

    return res.json(
      this.success({}),
    );
  };
}

const controller = new LoginController();

export const loginController = controller.login;