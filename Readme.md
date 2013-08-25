
# validator

  Validates schemas with support for async callbacks, promises, and thunks
  This project is still in it's infancy, documentation and a stable API coming soon

## Installation

  Install with [component(1)](http://component.io):

    $ component install ilsken/validator

## Example
```javascript
var validator = require('validator')
var v = new validator({
	enum: function(value, values) {
		if (values.indexOf(value) == -1)
			throw new TypeError('must be one of the enum values: ' + values.join(','))
	}, 
	exampleAsync: function (value, options, next) {
		setTimeout(function(){
			next(new Error('failed after timeout'))
		}, 400)
	}
})

// only runs the enum validator
v.validate({
	enum: ['foo', 'bar']
},'baz', function(errors, valid) {
	console.log('result: ', err, valid) // errors.enum == 'must be one of the enum values: foo, bar'
})

// async callbacks
v.validate({
	exampleAsync: true
},'baz', function(errors, valid) {
	console.log('result after timeout: ', valid)
})

// fail after the first error
// only runs the enum validator
v.validate({
	enum: ['foo', 'bar'],
	somethingAsync: true
},'baz', true, function(errors, valid) {
	console.log('result: ', err, valid)
})
```

Async validator function must either take 3 arguments (`value, options, next`), return a promise, or return a thunk


## License

  MIT
