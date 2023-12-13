import BaseRequest from './BaseRequest';

export default class CreateHistoryMediaRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        'mediaId': 'string',
      },
    ];
  }
}