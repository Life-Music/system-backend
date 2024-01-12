import { Request } from 'express';
import BasePaginationRequest from '../BasePaginationRequest';

export default class CategorySearchRequest extends BasePaginationRequest {

  public prepareValidation(req: Request): void {

    req.query.take = parseInt(req.query.take as string) || 10;
    req.query.page = parseInt(req.query.page as string) || 1;
    req.query.name ??= '';
    req.query.id ??= '';
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
      {
        name: 'string',
        _source: 'query',
      },
      {
        id: 'string',
        _source: 'query',
      },
    ];
  }
}
