/* global it, describe, beforeEach */
import 'babel-core/external-helpers';
import {Validator, ValidationError, ValidatorError} from '../src/index.js';
import Promise from 'bluebird';
import assert from 'assert';
var v;
function min(value, min_value) {
  if (min_value || min_value === 0) assert(value < min_value)
}

describe('Validator', function() {
  beforeEach(function () {
    v = new Validator()
  })

  describe('#rules', function() {
    it('should add rules from object', function() {
      v.rules({min: min})
      assert.strictEqual(v._rules.min.fn, min, 'min rule')
    })
  })

  describe('#rule', function() {
    it('should add rules', function() {
      v.rule('min', min)
      assert.strictEqual(v._rules.min.fn, min, 'min rule')
    })
  })

  describe("#validate", function() {
    it('should evaluate all enabled rules', function (next) {
      var count = 0;
      var test = function test() { count += 1; throw new Error('test') }

      v.rules({first: test, second:  test, third: test})
      .disable('second')
      .validate({foo: true})
      .catch(() => assert.strictEqual(count, 2, 'should only execute enabled rules'))
      .then(next, next);
    })
    it('should throw a ValidationError containing all ValidatorErrors', function (next) {
      var fail = () => {throw new TypeError('foo')};
      v.rules({first: fail, second: fail})
       .validate({})
       .catch((error) => {
         assert(error instanceof ValidationError, 'should be a ValidationError');
         assert.strictEqual(error.errors.length, 2, 'should capture all ValidatorErrors');
         assert(error.errors[0] instanceof ValidatorError, 'should be a ValidatorError');
         assert(error.errors[0].error instanceof TypeError);
       }).then(next, next);
    })
  })
})
