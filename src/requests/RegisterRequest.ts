import BaseRequest from './BaseRequest';

export default class RegisterRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        email: 'string',
      },
      {
        username: 'string',
      },
      {
        password: 'string',
      },
      {
        firstName: 'string',
      },
      {
        lastName: 'string',
      },
    ];
  }

}