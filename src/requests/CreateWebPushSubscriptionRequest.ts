import BaseRequest from './BaseRequest';

export default class CreateWebPushSubscriptionRequest extends BaseRequest {

  public rules(): Record<string, string>[] {
    return [
      {
        'subscriptionToken': 'string',
      },
    ];
  }
}