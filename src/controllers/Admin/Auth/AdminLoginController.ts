import AdminBaseController from '../AdminBaseController';
import { Request, Response } from 'express';
import md5 from 'md5';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import jwt from 'jsonwebtoken';
import EnvVars from '@src/constants/EnvVars';

class AdminLoginController extends AdminBaseController {

  public adminLogin = async (req: Request, res: Response) => {
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      username: string
      password: string
    };

    fields.password = md5(fields.password);

    const checkAccount = await globalThis.prisma.admin.findFirst({
      where: fields,
    });

    if (!checkAccount) {
      throw new Error('Sai tên đăng nhập hoặc mật khẩu');
    }

    const token = jwt.sign({
      data: checkAccount,
    }, EnvVars.Jwt.Secret, { expiresIn: parseInt(EnvVars.Jwt.Exp) });


    return res.json(
      this.success({
        user: checkAccount,
        token,
      }),
    );
  };
}

const loginController = new AdminLoginController();

const adminLoginController = loginController.adminLogin;

export {
  adminLoginController,
};