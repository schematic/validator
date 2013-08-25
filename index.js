var each = require('each-component')

function validator (validators) {
	if (!this instanceof validator) return new validator(validators)
	this.validators = validators
}

validator.prototype.validate = function(options, value, strict, callback) {
	if (typeof strict === 'function') {
		callback = strict
		strict = false
	}
	return _validate(options, this.validators, value, strict, callback)
}

function _validate (options, validators, value, strict, callback) {
	var keys = Object.keys(options)
	var cancelled = false
	var pending = 0
	var errors = {}

	function handle (key, err) {
		pending -= 1
		errors[key] = err
		next(err)
	}
	function next(err) {
		if (cancelled) return
		if (err) {			
			cancelled = true
		}
		if (keys.length === 0 && pending <= 0) {
			callback(cancelled && errors || null, !cancelled)
		}
		if (keys.length === 0) return
		console.log('keys', keys, 'len', keys.length, pending)
		var key = keys.shift()
		pending += 1
		var done = function(err) {
			handle(key, err)
		}
		if (typeof validators[key] === 'function') {
			try {
				if (validators[key].length === 3) {
					validators[key](value, options[key], done)
				} else {
					var ret = validators[key](value, options[key])
					if (ret && typeof ret.then === 'function') {
						ret.then(done.bind(null, null), done)
					} else if(ret && typeof ret === 'function') {
						ret(done)
					} else {
						done()
					}
				}
				
			} catch (err) {
				done(err)
			}
		}
	}
	next()
}


