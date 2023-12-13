import { Request } from 'express';
import BasePaginationRequest from './BasePaginationRequest';

export default class ListArtistRequest extends BasePaginationRequest {

  public prepareValidation(req: Request): void {

    req.query.take = parseInt(req.query.take as string) || 10;
    req.query.page = parseInt(req.query.page as string) || 1;
    if (req.query.isSubscribed !== undefined) {
      req.query.isSubscribed = req.query.isSubscribed == 1;
    }
    else req.query.isSubscribed = undefined;
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
        isSubscribed: 'boolean',
        _source: 'query',
      },
      {
        q: 'string',
        _source: 'query',
      },
    ];
  }
}
