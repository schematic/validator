var ValidatorError = require('./validator')
  , exports = module.exports = ValidationError

function ValidationError (errors) {
  if (Array.isArray(errors)) this.errors = errors
  else this.errors = errors ? [errors] :[]
}

exports.prototype = Object.create(Error.prototype, {
  constructor: {
    value: ValidationError
  },
  name: {
    value: 'ValidationError'
  }
})

exports.prototype.add = function (rule, value, error) {
  error = error instanceof ValidationError || error instanceof ValidatorError
    ? error
    : new ValidatorError(rule, value, error);

  this.errors.push(error)
}

exports.prototype.toString = function() {
  return this.errors.length 
    ?  '[ Validation Error: \n' + this.errors.map(function(error){
        return ['   ' , error.rule , ': ', error.message].join('')
      }).join('\n') + '   ]'
    : '[ Validation Error ]'
}
