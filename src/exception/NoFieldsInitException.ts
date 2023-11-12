export default class NoFieldsInitException extends Error {
  public constructor(message: string = 'The init field isn\'t ready!') {
    super(message);
  }
}