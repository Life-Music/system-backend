import BaseRequest from '../BaseRequest';

export default class DeletePaymentRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        paymentMethodId: 'string',
        _source: 'query',
      },
    ];
  }

}