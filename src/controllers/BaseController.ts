import { Request, RequestHandler } from 'express';
import { SuccessResponse } from '../response/SuccessResponse';
import UnexpectedException from '@src/exception/UnexpectedException';
import NoFieldsInitException from '@src/exception/NoFieldsInitException';

export default class BaseController {

  public successResponseAdapter = new SuccessResponse();

  public constructor() {

  }

  public success: SuccessResponse['format'] = (data) => {
    return this.successResponseAdapter.format(data);
  };

  public successWithMeta: SuccessResponse['formatWithMeta'] = (data, meta) => {
    return this.successResponseAdapter.formatWithMeta(data, meta);
  };

  public buildMetaPagination = (totalObject: number, currentPage: number, perPage: number, endPage: number) => {
    return {
      total_object: totalObject,
      current_page: currentPage,
      per_page: perPage,
      end_page: endPage,
    };
  };

  public userInfo: RequestHandler = async (req: Request, res) => {
    if (!req.userInfo) return res.json(
      this.success({}),
    );
    const user = await globalThis.prisma.user.findFirstOrThrow({
      where: {
        email: req.userInfo.email,
      },
    });
    return res.json(
      this.success(user),
    );
  };

  public saveWebPushSubscription: RequestHandler = async (req: Request, res) => {
    if(!req.userInfo) throw new UnexpectedException();
    const userId = req.userInfo.id;
    if (!req.fields) throw new NoFieldsInitException();
    const fields = req.fields as {
      subscriptionToken: string
    };

    await globalThis.prisma.notificationSubscriptions.create({
      data: {
        subscription: fields.subscriptionToken,
        userId,
      },
    });

    return res.json(
      this.success({}),
    );
  };

}

const controller = new BaseController();
export const userInfoController = controller.userInfo;
export const saveWebPushSubscription = controller.saveWebPushSubscription;

