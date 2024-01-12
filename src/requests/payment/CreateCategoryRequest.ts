import BaseRequest from '../BaseRequest';

export default class CreateCategoryRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        name: 'string',
      },
      {
        hot: 'boolean',
      },
    ];
  }

}