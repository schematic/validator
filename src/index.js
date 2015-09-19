
/* @flow */
import ValidationError from './errors/validation';
import ValidatorError from './errors/validator';
import Promise from 'bluebird';

export type Settings = {[key:string]:?any};
export type RuleFunction<T> = (value: T, settings: ?Settings) => Promise<void>;

class Rule<T> {
  fn: RuleFunction;
  enabled: boolean;
  constructor(fn: RuleFunction, enabled: boolean=true) {
    Object.defineProperties(this, {
      fn: { value: fn },
      enabled: { value: !!enabled, writable: true }
    });
  }
}

export type RuleMap<T> = {[key:string]: Rule<T>};

export default class Validator<T> {
  _rules: RuleMap<T>;
  settings: Settings;
  constructor(rules : ?RuleMap<T> = null, enable: boolean = false) {
    Object.defineProperties(this, {
      _rules: {
        value: Object.create(null)
      },
      settings: {
        value: Object.create(null)
      }
    });
    if (rules)
      this.rules(rules, enable);
  }

  rules(rules: RuleMap<T>, enable: boolean=true) : Validator<T> {
    Object
      .keys(rules)
      .forEach((key) => this.rule(key, rules[key], enable));
    return this;
  }

  rule(name: string, rule : RuleFunction<T>, enable: boolean=true) : Validator<T>  {
    this._rules[name] = new Rule(rule, enable);
    return this;
  }

  enable(name: string) : Validator<T> {
    this._rules[name].enabled = true;
    return this;
  }

  disable(name: string) : Validator<T> {
    this._rules[name].enabled = false;
    return this;
  }

  toggle(name: string) : Validator<T> {
    var rule = this._rules[name];
    rule.enabled = !rule.enabled;
    return this;
  }

  enabled(name: string) : boolean {
    return this._rules[name].enabled;
  }

  disabled(name: string) : boolean {
    return !this.enabled(name);
  }

  set(name: Settings & string, value: ?any) : Validator<T> {
    if (arguments.length === 1) {
      Object
        .keys(name)
        .forEach(key => this.settings[key] = name[key]);
    } else {
      this.settings[name] = value;
    }

    return this;
  }

  get(name: string) : any {
    return this.settings[name];
  }

  validate(value : any, context: ?any) : Promise<void> {
    return validate(this, value, context);
  }

}

function validate<T>(validator: Validator, value: T, context: ?any) : Promise<void> {
  // we return a new promise so we can use resolve/reject
  // in bluebird unexpected errors will be ignored by .error()
  // lets us find bugs more easily since they are not OperationErrors
  return new Promise(function(resolve, reject) {
    // get a list of enabled rules
    var rules: Array<string> = Object.keys(validator._rules).filter(isEnabled(validator._rules));

    // run all validator functions
    return Promise.settle(rules.map(function(rule) {
      // wrap in try in case they are not returning promises
      return Promise.try(validator._rules[rule].fn,
                         [value, validator.settings[rule]],
                         context);
    })).then(function(results) {
      var errors : Array<ValidatorError> = [];
      // gather errors from rejected promises
      results.forEach(function(result: Promise<void>, index: number) {
        if (result.isRejected()) {
          errors.push(new ValidatorError(rules[index], value, result.reason()));
        }
      });
      // and now we are done
      if (errors.length > 0) reject(new ValidationError(errors));
      else resolve();
    });
  });

}

function isEnabled<T>(rules: RuleMap<T>) {
  return function(key: string) {
    return rules[key].enabled;
  };
}

export {Validator, ValidationError, ValidatorError};
