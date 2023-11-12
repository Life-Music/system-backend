// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TSuccessResponseData = any

interface ISuccessResponse {
  success: true;
  data: TSuccessResponseData
}

interface ISuccessResponseMetaData<T> extends ISuccessResponse {
  meta: T
}

export class SuccessResponse {
  public format(data: TSuccessResponseData): ISuccessResponse {
    return {
      success: true,
      data,
    };
  }

  public formatWithMeta<T>(data: TSuccessResponseData, meta: T): ISuccessResponseMetaData<T> {
    return {
      success: true,
      data,
      meta,
    }
  }
}