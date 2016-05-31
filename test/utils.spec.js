"use strict";

var expect = require('chai').expect;
const utils = require('../lib/utils.js');

describe('normalizeName', function() {
    it('should remove prefix', function() {
        var initial = '123__foo_bar.html';
        expect(utils.normalizeName(initial)).to.equal('foo_bar.html');
    });

    it('should remove only first prefix', function() {
        var initial = '123__foo__bar.html';
        expect(utils.normalizeName(initial)).to.equal('foo__bar.html');
    });

    it('should not touch string without prefix', function() {
        var initial = 'foo_bar.html';
        expect(utils.normalizeName(initial)).to.equal('foo_bar.html');
    });
});