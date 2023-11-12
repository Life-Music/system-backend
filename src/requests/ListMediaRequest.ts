import { Request } from "express";
import BaseRequest from "./BaseRequest";
import { PerPages } from "@src/constants/misc";

export default class ListMediaRequest extends BaseRequest {

  public prepareValidation(req: Request): void {
    req.body.take ??= PerPages.LIST_MEDIA
    req.body.page ??= 1
  }

  public rules(): Record<string, string>[] {
    return [
      {
        take: 'number',
      },
      {
        page: 'number',
      }
    ]
  }
}
