import { Request, RequestHandler } from 'express';
import { SuccessResponse } from '../response/SuccessResponse';

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

}

const controller = new BaseController();
export const userInfoController = controller.userInfo;

