import BaseRequest from './BaseRequest';

export default class CreateAlbumRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        name: 'string',
      },
      {
        description: 'string',
      },
    ];
  }
}