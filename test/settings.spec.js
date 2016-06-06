"use strict";

var expect = require('chai').expect;

const settings = require('../lib/settings');

describe('Settings', function () {
    it('should have supportedExt property', function () {
        expect(settings).to.have.property('supportedExt');
    });

    it('should have sass_entry property', function () {
        expect(settings).to.have.property('sass_entry');
    });

    it('should have paths property', function () {
        expect(settings).to.have.property('paths');
    });

    it('should have paths.static property', function () {
        expect(settings.paths).to.have.property('static');
    });

    it('should have paths property', function () {
        expect(settings.paths).to.have.property('templates');
    });

    it('should have static_css property', function () {
        expect(settings).to.have.property('static_css');
    });

    it('should have static_js property', function () {
        expect(settings).to.have.property('static_js');
    });
});


