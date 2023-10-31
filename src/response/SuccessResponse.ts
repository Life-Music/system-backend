// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TSuccessResponseData = any

interface ISuccessResponse {
  success: true;
  data: TSuccessResponseData
}

export class SuccessResponse {
  public format(data: TSuccessResponseData): ISuccessResponse {
    return {
      success: true,
      data,
    };
  }
}