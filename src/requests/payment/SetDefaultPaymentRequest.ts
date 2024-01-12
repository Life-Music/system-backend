import BaseRequest from '../BaseRequest';

export default class SetDefaultPaymentRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        paymentMethodId: 'string',
      },
    ];
  }

}