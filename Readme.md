![validator](http://i.imgur.com/YTyduvl.png)
# validator

  A simple asynchronous validator written for the next generation of javascript.  

## Installation

  Install with [npm(1)](http://npmjs.org):

    $ npm install schematic/validator

  To keep things lighter for people using browserify and the like, validator is compiled with babel using `externalHelpers: true`. So make sure in your top-level application that you `npm install babel-core` and `require('babel-core/externalHelpers')`

## API

### Validator([RuleFunction])
Creates a new validator, you may optionally pass an object with names/rules. Rule functions will be called with `fn(value, settings)`

### #.rule(name, fn, enable = true) : Validator
Adds a new rule and returns itself for chaining. There are 2 types of rules. If you pass `enable=false`, this rule won't run when you call `#.validate` until you call `#.enable(name)`

#### Assert Rule
```javascript
v.rule('min', function(value, min_value) {
  if (min_value !=== false && value < min_value) throw new TypeError('must be greater than ' + min_value)
})
```
#### Promise Rule
```javascript
v.rule('min', function (value, min_value) {
  return functionThatReturnsAPromise(value, min_value)
})
```

### #.rules(ruleMap, enable = true) : Validator
Each name/function pair in the `ruleMap` will be added to the validator as if called with `#.rule(key, value, enable)`. Returns self for chaining

### #.validate<T>(value: T, context: ?any) : Promise<T>
Validates a `value` with the all enabled rules.
You may optionally supply a `context` object which will be used to call the rule functions (`rule.call(context, value, settings[rule_name])`). You can use the `#set` method to control the settings for each rule.

Returns a Promise that either resolves to `value` or rejects with a `ValidationError` containing a list of all `ValidatorError`'s that occurred. You can access them via the `errors` property.

```javascript
v.validate(user)
 .then(saveToDatabase)
 .catch(function (e) {
   console.log(e.errors.length, ' errors occurred');
   console.log(e.toString());
 })
```

### #.set(ruleName: string, settingValue: any): Validator
Set the value passed to the rule specified by `ruleName` when the validator runs. Returns self for chaining.

### #.get(ruleName: string): Validator
Gets the settings for `ruleName`

### #.enable/disable(ruleName: string) : Validator
Enables or disables `ruleName`

### #.enabled/disabled(ruleName: string) : boolean
Returns whether or not `ruleName` is enabled or disabled respectively

### #.toggle(ruleName: string) : boolean
Toggles whether or not `ruleName` is enabled


## License

  MIT
