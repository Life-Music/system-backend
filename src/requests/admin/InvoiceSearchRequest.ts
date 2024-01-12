import { Request } from 'express';
import BaseRequest from '../BaseRequest';

export default class InvoiceSearchRequest extends BaseRequest {

  public prepareValidation(req: Request): void {

    req.query.id ??= '';
    req.query.user_id ??= '';
  }

  public rules(): Record<string, string>[] {
    return [
      {
        id: 'string',
        _source: 'query',
      },
      {
        user_id: 'string',
        _source: 'query',
      },
    ];
  }
}
