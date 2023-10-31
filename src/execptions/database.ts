export default class DatabaseNotReady extends Error {
  public constructor(message: string = 'Database isn\'t ready!') {
    super(message);
  }
}