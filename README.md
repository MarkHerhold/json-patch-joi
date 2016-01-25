# JSON Patch Validation with Joi

> Validates JSON Patches ([RFC 6902](https://tools.ietf.org/html/rfc6902)) using Joi. Provides a simple and foolproof way to validate user updates. Please take a look at [this article](https://medium.com/@markherhold/validating-json-patch-requests-44ca5981a7fc) for rationale and motivations.

:point_right: This is more of an example repository than a module. I encourage you to implement the ~5 lines of code in [index.js](index.js) in your own project. Be sure to check [package.json](package.json) for the correct Joi dependency, which is currently a fork, [MarkHerhold/joi](https://github.com/MarkHerhold/joi).

## Usage

```js
let validate = require('json-patch-joi');
let Joi = require('joi');

// the object that you want to patch
let origObj = {
    id: 'k1773y',
    name: 'Cuddles',
    favoriteToys: ['string'],
    meta: {
        born: 1452474481612,
        weight: 2.1 // pounds
    }
};

// define a schema
let schema = Joi.object().keys({
    id: Joi.string().noChange(origObj).required().label('id'),
    name: Joi.string().required().label('name'),
    description: Joi.string().optional().label('description'),
    favoriteToys: Joi.array().items(Joi.string().label('toy')).default([]).label('favoriteToys'),
    meta: {
        born: Joi.number().positive().integer().noChange(origObj).required().label('born'),
        weight: Joi.number().positive().unit('pounds').label('weight')
    }
}).label('cat');

const patch = [{ op: 'replace', path: '/id', value: 'bad' }];

const result = validate(origObj, schema, patch);

if (result.error) {
    console.log('Validation error: ' + result.error.message);
}
if (!result.test) {
    console.log('JSON Patch test failed');
}
```

## API

### validate(object, schema, patch);
description
* `object` - the object to patch and validate
* `schema` - the Joi schema to validate against
* `patch` - the JSON Patches to apply. See [RFC 6902](https://tools.ietf.org/html/rfc6902).

#### Returns
Returns an object containing the following fields:
* `value` - the validated value with any type conversions and other modifiers applied. The original object will be mutated.
* `error` - if validation failed, the [error](https://github.com/hapijs/joi/blob/v7.2.1/API.md#errors) reason, otherwise `null`.
* `test` - If there was a test patch in patches array, returns the result of the test. See [fast-json-patch.apply](https://github.com/Starcounter-Jack/JSON-Patch#jsonpatchapply-obj-object-patches-array-validate-boolean--boolean)

## Caveats

* :warning: This validation strategy allows patches that modify a value protected by `noChange()` to be "updated" to the exact same value. The update will not be detected by `noChange()`, which means that users will not be informed that they are not allowed to modify the said field. I consider this an acceptable risk.
