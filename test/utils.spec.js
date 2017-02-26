'use strict';

const expect = require('chai').expect;
const mock = require('mock-fs');

const utils = require('../lib/utils.js');

describe('Utils', function () {
    describe('normalizeName', function () {
        it('should remove prefix', function () {
            let initial = '123__foo_bar.html';
            expect(utils.normalizeName(initial)).to.equal('foo_bar.html');
        });

        it('should remove only first prefix', function () {
            let initial = '123__foo__bar.html';
            expect(utils.normalizeName(initial)).to.equal('foo__bar.html');
        });

        it('should not touch string without prefix', function () {
            let initial = 'foo_bar.html';
            expect(utils.normalizeName(initial)).to.equal('foo_bar.html');
        });
    });

    describe('readTemplate', function () {
        before(function () {
            mock({
                'lib/templates/default/tpls': {
                    'A.html': 'AAA',
                    'some': {
                        'deep': {
                            'path': {
                                'B.html': 'BBB',
                            },
                        },
                    },
                },
            });
        });

        after(function () {
            mock.restore();
        });

        it('should read file', function () {
            let content = utils.readTemplate('A.html');
            expect(content).to.equal('AAA');
        });

        it('should resolve path', function () {
            let content = utils.readTemplate('some', 'deep', 'path', 'B.html');
            expect(content).to.equal('BBB');
        });
    });
});


