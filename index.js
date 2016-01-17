'use strict';

var Joi = require('joi');
var jsonpatch = require('fast-json-patch');

module.exports = function validate(origObj, schema, patches) {
    const test = jsonpatch.apply(origObj, patches);

    let res = Joi.validate(origObj, schema);
    res.test = test;

    // Optionally, we could throw an error if:
    // * res.test !== true, meaning that a JSON Patch test operation failed
    // * res.error !== null, meaning that Joi found a validation error
    // If either of these happen, the patch should be rejected

    return res;
};
