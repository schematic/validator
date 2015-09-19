'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _errorsValidation = require('./errors/validation');

var _errorsValidation2 = babelHelpers.interopRequireDefault(_errorsValidation);

var _errorsValidator = require('./errors/validator');

var _errorsValidator2 = babelHelpers.interopRequireDefault(_errorsValidator);

var _bluebird = require('bluebird');

var _bluebird2 = babelHelpers.interopRequireDefault(_bluebird);

class Rule {
  constructor(fn) {
    let enabled = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    Object.defineProperties(this, {
      fn: { value: fn },
      enabled: { value: !!enabled, writable: true }
    });
  }
}

class Validator {
  constructor() {
    let rules = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    let enable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    Object.defineProperties(this, {
      _rules: {
        value: Object.create(null)
      },
      settings: {
        value: Object.create(null)
      }
    });
    if (rules) this.rules(rules, enable);
  }

  rules(rules) {
    let enable = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    Object.keys(rules).forEach(key => this.rule(key, rules[key], enable));
    return this;
  }

  rule(name, rule) {
    let enable = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    this._rules[name] = new Rule(rule, enable);
    return this;
  }

  enable(name) {
    this._rules[name].enabled = true;
    return this;
  }

  disable(name) {
    this._rules[name].enabled = false;
    return this;
  }

  toggle(name) {
    var rule = this._rules[name];
    rule.enabled = !rule.enabled;
    return this;
  }

  enabled(name) {
    return this._rules[name].enabled;
  }

  disabled(name) {
    return !this.enabled(name);
  }

  set(name, value) {
    if (arguments.length === 1) {
      Object.keys(name).forEach(key => this.settings[key] = name[key]);
    } else {
      this.settings[name] = value;
    }

    return this;
  }

  get(name) {
    return this.settings[name];
  }

  validate(value, context) {
    return validate(this, value, context);
  }

}

exports.default = Validator;

function validate(validator, value, context) {
  // we return a new promise so we can use resolve/reject
  // in bluebird unexpected errors will be ignored by .error()
  // lets us find bugs more easily since they are not OperationErrors
  return new _bluebird2.default(function (resolve, reject) {
    // get a list of enabled rules
    var rules = Object.keys(validator._rules).filter(isEnabled(validator._rules));

    // run all validator functions
    return _bluebird2.default.settle(rules.map(function (rule) {
      // wrap in try in case they are not returning promises
      return _bluebird2.default.try(validator._rules[rule].fn, [value, validator.settings[rule]], context);
    })).then(function (results) {
      var errors = [];
      // gather errors from rejected promises
      results.forEach(function (result, index) {
        if (result.isRejected()) {
          errors.push(new _errorsValidator2.default(rules[index], value, result.reason()));
        }
      });
      // and now we are done
      if (errors.length > 0) reject(new _errorsValidation2.default(errors));else resolve();
    });
  });
}

function isEnabled(rules) {
  return function (key) {
    return rules[key].enabled;
  };
}

exports.Validator = Validator;
exports.ValidationError = _errorsValidation2.default;
exports.ValidatorError = _errorsValidator2.default;