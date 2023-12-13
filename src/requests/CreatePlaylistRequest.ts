import BaseRequest from './BaseRequest';

export default class CreatePlayListRequest extends BaseRequest {

  public rules(): Record<string, string>[] {
    return [
      {
        'title': 'string',
      },
    ];
  }
}