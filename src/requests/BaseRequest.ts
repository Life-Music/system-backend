import { Request } from 'express';
import jetValidator from 'jet-validator/lib/jet-validator';
const validate = jetValidator();
class BaseRequest {

  public rules(): Array<Record<string, string>> {
    return [
    ];
  }

  public bindToRequest(req: Request) {
    const params: Record<string, unknown> = {
      ...req.params,
      ...req.body,
    };
    req.fields = Object.fromEntries(this.rules().map((rule) => {
      const [key] = Object.entries(rule)[0];
      return [
        key,
        params[key] ?? '',
      ];
    }));
  }

  public prepareValidation(req: Request) {

  }

  public validation = (req: Request) => {
    this.prepareValidation(req)

    const validation = validate(...this.rules().map(rule => Object.entries(rule)).flat());

    this.bindToRequest(req);

    return validation;
  };
}

export default BaseRequest;