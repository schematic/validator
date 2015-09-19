/* @flow */
import ValidatorError from './validator';

export default class ValidationError extends Error {
  errors: Array<ValidatorError>;
  constructor(errors : Array<ValidatorError> | ValidatorError) {
    super();
    Object.defineProperty(this, "errors", {
      value: Array.isArray(errors) ? errors : [errors]
    });
  }
  toString() : string {
    if (this.errors.length > 0) {
      var validatorErrors = this.errors.map(function (error) {
        return `  ${error.toString()}`;
      }).join('\n');
      return `[ Validation Error: \n${validatorErrors}  ]`;
    } else {
      return '[ Validation Error ]';
    }
  }
}
