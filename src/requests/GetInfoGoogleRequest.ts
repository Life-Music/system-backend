import BaseRequest from './BaseRequest';

export default class GetInfoGoogleRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        code: 'string',
      },
    ];
  }
}
