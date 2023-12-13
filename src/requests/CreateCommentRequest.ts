import BaseRequest from './BaseRequest';

export default class CreateCommentRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        'content': 'string',
      },
    ];
  }
}