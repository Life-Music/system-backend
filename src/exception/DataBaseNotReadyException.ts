export default class DataBaseNotReadyException extends Error {
  public constructor(message: string = 'Database isn\'t ready!') {
    super(message);
  }
}