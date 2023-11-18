import BaseRequest from './BaseRequest';

export default class MediaUploadDoneRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        fileId: 'string',
      },
    ];
  }
}