'use strict';

var validate = require('./../index');
var expect = require('chai').expect;
var Joi = require('joi');

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var origObj = {
    id: 'k1773y',
    name: 'Cuddles',
    favoriteToys: ['string'],
    meta: {
        born: 1452474481612,
        weight: 2.1 // pounds
    }
};

// Cat object representation schema
var schema = Joi.object().keys({
    id: Joi.string().noChange(origObj).required().label('id'),
    name: Joi.string().required().label('name'),
    description: Joi.string().optional().label('description'),
    favoriteToys: Joi.array().items(Joi.string().label('toy')).default([]).label('favoriteToys'),
    meta: {
        born: Joi.number().positive().integer().noChange(origObj).required().label('born'),
        weight: Joi.number().positive().unit('pounds').label('weight')
    }
}).label('cat');

describe('JSON Patch Validation', function() {
    it('should successfully add a top-level description field', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'add',
            path: '/description',
            value: 'My fuzzy kitten, Cuddles'
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error).to.equal(null);
    });

    it('should successfully remove an element from /favoriteToys/0', function() {
        var obj = clone(origObj);

        const patch = [{
            "op": "remove",
            "path": "/favoriteToys/0"
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error).to.equal(null);
    });

    it('should successfully remove an element from /favoriteToys/2', function() {
        var obj = clone(origObj);

        const patch = [{
            "op": "remove",
            "path": "/favoriteToys/2"
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error).to.equal(null);
    });

    // test for example from article, gist: https://gist.github.com/MarkHerhold/795cc1f73065ca2f3b76
    it('should fail to replace a nested field', function() {
        let obj = { nested: { stuff: true } };

        const patch = [{
            op: 'replace',
            path: '/nested/stuff',
            value: 'something else'
        }];

        const schema = Joi.object().keys({
            nested: Joi.object().keys({
                stuff: Joi.any().noChange(obj)
            })
        });

        const res = validate(clone(obj), schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error.message).to.equal('child "nested" fails because [child "stuff" fails because ["stuff" is not allowed to be changed]]');
    });

    it('should fail to replace the top-level id field', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'replace',
            path: '/id',
            value: 'f00zy'
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error.message).to.equal('child "cat" fails because ["id" is not allowed to be changed]');
    });

    it('should fail to remove /meta/created', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'remove',
            path: '/meta/born'
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error.message).to.equal('child "cat" fails because [child "cat" fails because ["born" is required]]');
    });

    it('should fail to copy from /favoriteToys/0 to /id', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'copy',
            path: '/id',
            from: '/favoriteToys/0'
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error.message).to.equal('child "cat" fails because ["id" is not allowed to be changed]');
    });

    it('should fail to move from /favoriteToys/0 to /id', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'move',
            path: '/id',
            from: '/favoriteToys/0'
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error.message).to.equal('child "cat" fails because ["id" is not allowed to be changed]');
    });

    it('should fail to patch even when field does not change - set /meta/born to 1452474481612', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'replace',
            path: '/meta/born',
            value: 1452474481612
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).eql(obj);
        expect(res.error).to.equal(null);
    });

    it('should fail to move a non existent field, /meta/foo to /id', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'move',
            path: '/id',
            from: '/meta/foo'
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error.message).to.equal('child "cat" fails because ["id" is required]');
    });
});

describe('JSON Patch "test" Operation', function() {
    it('should perform a passing test', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'test',
            path: '/meta/born',
            value: 1452474481612
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error).to.equal(null);
        expect(res.test).to.equal(true);
    });

    it('should perform a failing test', function() {
        var obj = clone(origObj);

        const patch = [{
            op: 'test',
            path: '/meta/born',
            value: '??'
        }];

        const res = validate(obj, schema, patch);
        expect(res.value).to.be.an('object');
        expect(res.error).to.equal(null);
        expect(res.test).to.equal(false);
    });
});
