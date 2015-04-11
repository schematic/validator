/* jshint evil: false */
var ValidationError = require('./errors/validation')
  , compile = require('to-function')
  , Configurable = require('configurable')
  , asap = require('asap')
  , exports = module.exports = Validator

function Validator(rules) {
  this._rules = {}
  this.rules(rules)
  this.disable('strict')
}

Configurable(exports.prototype)

exports.prototype.rule = function(name, fn) {
  if (fn === undefined) return (fn = this._rules[name]).validate ? fn.validate : fn
  if (name === 'strict') throw new Error('rules can not use reserved name `strict`')
  this._rules[name] = 'string' === typeof fn ? wrap(fn) : fn
  return this
}

exports.prototype.rules = function (object) {
  if (object === undefined) return this._rules
  var self = this
  Object
    .keys(object)
    .forEach(function(key) {
      self.rule(key, object[key])
    })
  return this
}

exports.prototype.validate = function(value, settings, context, callback) {
  if ('function' === typeof settings) {
    callback = settings
    context = null
    settings = undefined
  }
  if ('function' === typeof context) {
    callback = context
    context = null
  }
  var rules = this._rules
    , strict = this.enabled('strict')
  settings = settings || this.settings

  asap(function (){
    validate(value, rules, settings, strict,context, callback)
  })
}


function validate (value, rules, settings, strict, context, callback) {
  var keys = Object.keys(settings)
    , job = { pending: keys.length
            , done: false
            , strict: strict
            , report: new ValidationError()
            }

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
      , rule = rules[key]
      execute(context, rule && rule.validate || rule, value, settings[key], handle(key,settings[key], job, callback)) 
  }
}

function execute(context, rule, value, settings, next) {
  if (!rule) {
    next()
  } else if (rule.length === 3) {
    rule.call(context, value, settings, next)
  } else {
    try {
      var result = rule.call(context, value, settings)
      //
      // Promises
      //
      if (result && 'function' === typeof result.then)
        result.then(next.bind(null, null), next)

      //
      // Thunk Functions
      //
      else if ('function' === typeof result) 
        result(next)

      //
      // Plain Functions (must throw an error)
      //
      else {
        next()
      }
    } catch (error) {
      // if a plain function throws an error report it
      next(error)
    }
  }
 }

 function handle(key, value, job, callback) {
   var has_fired = false
   return function (error) {
    if (job.done) return
    if (has_fired) throw Error('validation callback can only be called once')  
    var is_complete =  --job.pending === 0
      , done = job.done = (job.strict && error) || is_complete
      , has_errors = job.report.errors.length > 0 || error

    if (error) job.report.add(key,value, error)
    if (done) {
      has_fired = true
      if (Error.captureStackTrace) Error.captureStackTrace(job.report, ValidationError)
      callback(has_errors && job.report, has_errors)
    }
   }
 }

 function wrap(str) {
  return (new Function('str', 'fn', 'return function(value, enabled) { if(enabled === true && !fn(value)) throw new Error("failed: " + str) }'))(str, compile(str))
}
