'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _validator = require('./validator');

var _validator2 = babelHelpers.interopRequireDefault(_validator);

class ValidationError extends Error {
  constructor(errors) {
    super();
    Object.defineProperty(this, "errors", {
      value: Array.isArray(errors) ? errors : [errors]
    });
  }
  toString() {
    if (this.errors.length > 0) {
      var validatorErrors = this.errors.map(function (error) {
        return `  ${ error.toString() }`;
      }).join('\n');
      return `[ Validation Error: \n${ validatorErrors }  ]`;
    } else {
      return '[ Validation Error ]';
    }
  }
}

exports.default = ValidationError;
module.exports = exports.default;