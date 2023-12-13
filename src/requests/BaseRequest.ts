import { Request } from 'express';
import jetValidator from 'jet-validator/lib/jet-validator';
const validate = jetValidator();
class BaseRequest {

  public rules(): Array<Record<string, string>> {
    return [
    ];
  }

  public bindToRequest(req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const params: Record<string, unknown> = {
      ...req.query,
      ...req.body,
      ...req.files,
    };
    req.fields = Object.fromEntries(this.rules().map((rule) => {
      const [key] = Object.entries(rule)[0];
      return [
        key,
        params[key] ?? undefined,
      ];
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public prepareValidation(req: Request) {

  }

  public validation = (req: Request) => {
    this.prepareValidation(req);

    const rules = [...this.rules().map(rule => {
      const rules = Object.entries(rule);
      let _source: string = 'body';
      let data: string[] = [];
      for (const _rule of rules) {
        if (_rule[0] === '_source') {
          _source = _rule[1];
        }
        else {
          data = [_rule[0], _rule[1]];
        }
      }

      return [
        ...data,
        _source,
      ];
    }).flat()] as [
        string,
        string,
        'body' | 'query' | 'params',
      ];

    const validation = validate(rules);
    this.bindToRequest(req);

    return validation;
  };
}

export default BaseRequest;