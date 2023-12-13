import { Request } from 'express';
import BasePaginationRequest from './BasePaginationRequest';

export default class ListMediaRequest extends BasePaginationRequest {

  public prepareValidation(req: Request): void {

    req.query.take = parseInt(req.query.take as string) || 10;
    req.query.page = parseInt(req.query.page as string) || 1;
    if (req.query.isLike !== undefined) {
      req.query.isLike = req.query.isLike == 1;
    }
    else req.query.isLike = undefined;
    req.query.q ??= '';
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
        isLike: 'boolean',
        _source: 'query',
      },
      {
        q: 'string',
        _source: 'query',
      },
    ];
  }
}
