/*global describe, it, beforeEach, before, afterEach: true*/

'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var rewire = require('rewire');
var _ = require('lodash');

var validation = rewire('../../lib/validation/validation');

var ERROR_NUMBER_TEXT = 'value should be number';
var ERROR_STRING_TEXT = 'value should be string';

describe('validation', function () {
    describe('#getValue', function () {
        var getValue;
        before(function () {
            getValue = validation.__get__('getValue');
            validation.setRules({
                toBeNumber: function (data) {
                    if (!_.isNumber(data)) {
                        return ERROR_NUMBER_TEXT;
                    }
                },
                toBeString: function (data) {
                    if (!_.isString(data)) {
                        return ERROR_STRING_TEXT;
                    }
                }
            });
        });

        it('should return value from object by path', function () {
            var testOject = {
                foo: {
                    bar: 1
                }
            };

            var result = getValue(testOject, ['foo', 'bar']);
            expect(result.success).to.eql(true);
            expect(result.value).to.eql(testOject.foo.bar);
        });

        it('should return object with error field', function () {
            var result = getValue({}, ['foo', 'bar']);
            expect(result.success).to.eql(false);
            expect(result.error).to.be.a('string');
            expect(result.error).to.contain('foo');
        });
    });

    describe('#addValidation', function () {
        it('should create middleware that make validation', function () {
            var nextSpy = sinon.spy();

            var request = {
                params: {
                    foo: 1
                }
            };

            var route = validation.addValidation({from: 'params.foo', rule: 'toBeNumber'});

            route(request, {}, nextSpy);
            expect(nextSpy.called).to.eql(true);
            expect(nextSpy.getCall(0).args[0]).to.eql(undefined);
        });
    });

});
