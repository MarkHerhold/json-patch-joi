'use strict';

var Joi = require('joi');
var jsonpatch = require('fast-json-patch');

module.exports = function validate(origObj, schema, patches) {
    // You should consider cloning origObj before patching it!
    // Use either one of the following:
    // * origObj = JSON.parse(JSON.stringify(origObj));
    // * origObj = lodash.cloneDeep(origObj); Link: https://lodash.com/docs#cloneDeep
    // * origObj = Hoek.clone(origObj); Link: https://github.com/hapijs/hoek#cloneobj

    const test = jsonpatch.apply(origObj, patches);

    let res = Joi.validate(origObj, schema);
    res.test = test;

    // Optionally, we could throw an error if:
    // * res.test !== true, meaning that a JSON Patch test operation failed
    // * res.error !== null, meaning that Joi found a validation error
    // If either of these happen, the patch should be rejected

    return res;
};
