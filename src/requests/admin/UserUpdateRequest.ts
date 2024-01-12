import BaseRequest from '../BaseRequest';

export default class UserUpdateRequest extends BaseRequest {

  public rules(): Record<string, string>[] {
    return [
      {
        firstName: 'string',
      },
      {
        lastName: 'string',
      },
      {
        email: 'string',
      },
      {
        userName: 'string',
      },
    ];
  }
}
