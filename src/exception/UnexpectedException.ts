export default class UnexpectedException extends Error {
  public constructor(message: string = 'Something went wrong!') {
    super(message);
  }
}