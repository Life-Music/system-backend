import { Request } from 'express';
import BaseRequest from './BaseRequest';

export default class UpdateProfileRequest extends BaseRequest {

  public prepareValidation(req: Request): void {

    req.body.password ??= '';
    req.body.oldPassword ??= '';
    req.body.firstName ??= '';
    req.body.lastName ??= '';
  }

  public rules(): Record<string, string>[] {
    return [
      {
        firstName: 'string',
      },
      {
        lastName: 'string',
      },
      {
        password: 'string',
      },
      {
        oldPassword: 'string',
      },
    ];
  }

}