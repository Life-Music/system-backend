import BaseRequest from './BaseRequest';

export default class BaseSearchRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        q: 'string',
        _source: 'query',
      },
    ];
  }
}
