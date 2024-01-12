import BaseRequest from '../BaseRequest';

export default class CreatePaymentRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        token: 'string',
      },
    ];
  }

}