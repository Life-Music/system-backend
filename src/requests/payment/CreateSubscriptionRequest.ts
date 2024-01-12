import BaseRequest from '../BaseRequest';

export default class CreateSubscriptionRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        productId: 'string',
      },
    ];
  }

}