/* global describe, it, beforeEach */
var Validator = require('../index')
  , assert = require('assert')
  , v;

describe('Validator Types', function (){
  beforeEach(function(){
    v = new Validator()
  })

  it('string validators', function(done) {
    v.rule('can drink', 'age >= 21') // 'murica
     .rule('can join army', 'age >= 18')
    .enable('can drink')
    .enable('can join army')
    .validate({age: 18}, function(error) {
      try {
        console.log(error.toString())
        assert.strictEqual(error.errors.length, 1, 'error count must be 1')
        done()
      } catch (err) {
        done(err)
      }
    })
  })

  it('plain functions', function(done) {
    v.rule('is_foo', function(value){  if(value !== 'foo') throw new TypeError('must be foo')  })
     .rule('not_foo', function(value) { if(value === 'foo') throw new TypeError('must not be foo') })
       .validate('foo', {is_foo: true, not_foo: true}, function(error) {
         try {
          assert.strictEqual(error.errors.length, 1, 'error count must be 1')
          done()
         } catch (err) {
           done(err)
         }
       })
  })
})
