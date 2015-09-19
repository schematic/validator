"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class ValidatorError extends Error {

  constructor(rule, value, error) {
    super();
    Object.defineProperties(this, {
      name: { value: "ValidatorError" },
      message: { value: error.message },
      stack: { value: error.stack },
      rule: { value: rule },
      value: { value: null },
      error: { value: error }
    });
  }
  toString() {
    if (!this.error.message) {
      return `[ ${ this.rule } ]`;
    } else {
      return `[ ${ this.rule }: ${ this.message } ]`;
    }
  }
}

exports.default = ValidatorError;
module.exports = exports.default;