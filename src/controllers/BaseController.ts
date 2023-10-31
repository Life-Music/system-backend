import { SuccessResponse } from '../response/SuccessResponse';

class BaseController {

  public successResponseAdapter = new SuccessResponse();

  public constructor() {

  }

  public success: SuccessResponse['format'] = (data) => {
    return this.successResponseAdapter.format(data);
  };

}

export default BaseController;