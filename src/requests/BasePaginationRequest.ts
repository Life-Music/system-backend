import { Request } from 'express';
import BaseRequest from './BaseRequest';

export type TBasePaginationRequest = {
  take: number;
  page: number
};

export default class BasePaginationRequest extends BaseRequest {

  public prepareValidation(req: Request): void {

    req.query.take = parseInt(req.query.take as string) || 10;
    req.query.page = parseInt(req.query.page as string) || 1;
  }

  public rules(): Record<string, string>[] {
    return [
      {
        take: 'number',
        _source: 'query',
      },
      {
        page: 'number',
        _source: 'query',
      },
    ];
  }
}
