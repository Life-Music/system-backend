import BaseRequest from './BaseRequest';

export default class UpdateReactionMediaRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        'type': 'string',
      },
    ];
  }
}