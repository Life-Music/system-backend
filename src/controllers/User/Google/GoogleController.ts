import BaseController from '@src/controllers/BaseController';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';
import UnexpectedException from '@src/exception/UnexpectedException';
import GoogleAuth from '@src/services/GoogleAuth';
import { Request, Response } from 'express';

const google = new GoogleAuth();

class GoogleController extends BaseController {

  public getInfo = async (req: Request, res: Response) => {
    if (!req.userInfo) throw new UnexpectedException();
    const userId = req.userInfo.id;
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      code: string
    };
    const tokenInfo = await google.getToken(fields.code);

    const userInfo = await google.getUserInfo(tokenInfo.access_token as string);

    const accountUrl = `https://accounts.google.com/${userInfo.id}`;
    const socialAccount = await globalThis.prisma.socialAccount.upsert({
      where: {
        userId_accountUrl_type: {
          userId,
          accountUrl,
          type: 'YOUTUBE',
        },
      },
      create: {
        userId,
        accountUrl,
        expiredAt: new Date(Date.now() + tokenInfo.expires_in * 1000),
        fullName: userInfo.name,
        accessToken: tokenInfo.access_token as string,
        refreshToken: tokenInfo.refresh_token as string,
        type: 'YOUTUBE',
        avatarUrl: userInfo.picture,
        disabledAt: new Date(),
      },
      update: {
        accessToken: tokenInfo.access_token,
        refreshToken: tokenInfo.refresh_token,
        expiredAt: new Date(Date.now() + tokenInfo.expires_in * 1000),
      },
    });

    return res.json(
      this.success(socialAccount),
    );
  };
}

const controller = new GoogleController();
const getGoogleInfo = controller.getInfo;

export {
  getGoogleInfo,
};