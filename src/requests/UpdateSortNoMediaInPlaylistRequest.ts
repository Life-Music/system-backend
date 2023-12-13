import BaseRequest from './BaseRequest';

export default class UpdateSortNoMediaInPlaylistRequest extends BaseRequest {

  public rules(): Record<string, string>[] {
    return [
      {
        'list': 'object',
      },
    ];
  }
}