import BaseRequest from '../BaseRequest';

export default class LoginRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        username: 'string',
      },
      {
        password: 'string',
      },
    ];
  }

}