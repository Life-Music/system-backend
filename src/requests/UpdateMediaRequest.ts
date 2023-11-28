import { Request } from 'express';
import BaseRequest from './BaseRequest';

export default class UpdateMediaRequest extends BaseRequest {
  public rules(): Record<string, string>[] {
    return [
      {
        title: 'string',
      },
      {
        description: 'string',
      },
      {
        viewMode: 'string',
      },
      {
        albumId: 'string',
      },
      {
        thumbnailId: 'string',
      },
      {
        categoryIds: 'object',
      },
    ];

  }

  public prepareValidation(req: Request): void {
    if (!req.body.thumbnailId) {
      req.body.thumbnailId = '';
    }
    if (!req.body.albumId) {
      req.body.albumId = '';
    }
    if (!req.body.categoryIds) {
      req.body.categoryIds = [];
    }
  }
}