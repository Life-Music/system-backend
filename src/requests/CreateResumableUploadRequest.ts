import BaseRequest from './BaseRequest';

export class CreateResumableUploadRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        mediaId: 'string',
      },
      {
        id: 'string',
      },
    ];
  }
}