import BaseController from '@src/controllers/BaseController';
import UnexpectedException from '@src/exception/UnexpectedException';
import { Request, Response } from 'express';

class SocialAccountController extends BaseController {

  public disableAccount = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    const id = parseInt(req.params.id);

    const current = await globalThis.prisma.socialAccount.findUniqueOrThrow({
      where: {
        id,
        userId: req.userInfo.id,
      },
    });

    const socialAccount = await globalThis.prisma.socialAccount.update({
      where: {
        userId: req.userInfo.id,
        id,
      },
      data: {
        disabledAt: current.disabledAt ? null : new Date(),
      },
    });

    return res.json(
      this.success(socialAccount),
    );
  };
}

const controller = new SocialAccountController();
const disableSocialAccount = controller.disableAccount;

export {
  disableSocialAccount,
};