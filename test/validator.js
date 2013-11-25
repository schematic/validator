/* global it, describe, beforeEach */
var Validator = require('../index')
  , assert = require('assert')
  , v

function min(value, min_value) {
  if (min_value || min_value === 0) assert(value < min_value)
}

describe('Validator', function() {
  beforeEach(function () {
    v = new Validator()
  })

  describe('#rules', function() {
    it('should add rules from object', function (){
      v.rules({min: min})
      assert.strictEqual(v._rules.min, min, 'min rule')
    })
  })

  describe('#rule', function() {
    it('should add rules', function() {
      v.rule('min', min)
      assert.strictEqual(v._rules.min, min, 'min rule')
    })

    it('should not allow rules with the name `strict`', function (){
      assert.throws(function(){
        v.rule('strict', min)
      })
    })

    it('should add string rules', function (){
      v.rule('str', '< 3')
      assert.ok(v._rules.str, 'string rule')
    })
  })

  describe("#validate", function () {
    it('should evaluate all rules', function (){
      var count = 0
        , test = function test() { count += 1; throw new Error('test') }

      v.rules({first: test, second:  test})
      .validate('foo', {first: true, second: true}, function (errors) {
        assert.strictEqual(count, 2, 'call count')
        assert.ok(errors, 'errors object exists')
        assert.strictEqual(errors.errors.length, 2, 'error count');
      })
    })

    it('should evaluate until error with strict enabled', function(){
      var count = 0
        , test = function test() { count += 1; throw new Error('test') }

      v.rules({first: test, second:  test})
        .enable('strict')
        .validate('foo', {first: true, second: true} , function (errors) {
          assert.strictEqual(count, 1, 'call count')
          assert.ok(errors, 'errors object exists')
          assert.strictEqual(errors.errors.length, 1, 'error count');
        })
    })



    it('should always execute callback in next tick', function (){
      var flag = true
      v.rule('foo', function(){flag = false})
       .enable('foo')
       .validate({bar: true}, function (){

       })
       assert.strictEqual(flag, true, 'flag set in same tick')
    })

  })
})
