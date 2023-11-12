export default class ResourceNotFound extends Error {
  public constructor(message: string = 'The resource doesn\'t exist!') {
    super(message);
  }
}