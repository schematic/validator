module.exports = ValidatorError

function ValidatorError (rule, value, error) {
  this.rule = rule
  this.message = error 
    ? error.message || error.toString()
    : ''

  this.error = error
  this.value = value
  if (error && error.stack) {
    Object.defineProperty(this, 'stack', {
      value: error.stack,
      configurable: true,
      writable: true,
      enumerable: false
    })
  } else if (Error.captureStackTrace) {
    Error.captureStackTrace(this, ValidatorError)
  }
}

ValidatorError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: ValidatorError
  },
  name: {
    value: 'ValidatorError'
  }
})

ValidatorError.prototype.toString = function () {
  return this.message ? '[' + this.rule + ']' : '[' + this.rule + ': ' + this.message + ']'
}
