import BaseRequest from "./BaseRequest";

export default class UpdateMediaRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        title: 'string'
      },
      {
        description: 'string'
      },
      {
        view_mode: 'string'
      },
      {
        thumbnailId: 'string'
      }
    ]
  }
}