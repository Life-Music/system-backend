import { Request, RequestHandler } from 'express';
import { SuccessResponse } from '../response/SuccessResponse';
import DatabaseNotReady from '@src/execptions/database';

class BaseController {

  public successResponseAdapter = new SuccessResponse();

  public constructor() {

  }

  public success: SuccessResponse['format'] = (data) => {
    return this.successResponseAdapter.format(data);
  };

  public userInfo: RequestHandler = async (req: Request, res) => {
    if (req.database) {
      if (!req.userInfo) return res.json(
        this.success({}),
      );
      const user = await req.database.user.findFirstOrThrow({
        where: {
          email: req.userInfo.email,
        },
      });
      return res.json(
        this.success(user),
      );
    }
    throw new DatabaseNotReady();
  };

}

const controller = new BaseController();
export const userInfoController = controller.userInfo;

export default BaseController;