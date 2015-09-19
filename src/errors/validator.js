/* @flow */
export default class ValidatorError<T> extends Error {
  name: string;
  stack: string;
  rule: string;
  value: ?T;
  error: Error;

  constructor(rule: string, value: T, error: Error) {
    super();
    Object.defineProperties(this, {
      name: {value: "ValidatorError"},
      message: { value: error.message },
      stack: {value: error.stack},
      rule: { value: rule },
      value: { value: null },
      error: { value: error }
    });
  }
  toString() : string {
    if (!this.error.message) {
      return `[ ${this.rule} ]`
    } else {
      return `[ ${this.rule}: ${this.message} ]`
    }
  }
}
