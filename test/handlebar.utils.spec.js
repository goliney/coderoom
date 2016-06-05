"use strict";

var expect = require('chai').expect;

const handlebars = require('handlebars');
require('../lib/handlebars.utils.js')(handlebars);

describe('Handlebar utils', function () {
    describe('path_to_root', function () {
        before(function () {
            this.html = '{{path_to_root depth}}';
        });
        
        it('should return ../ depth-times', function () {
            var template =  handlebars.compile(this.html);
            var context = {depth: 3};
            var result = template(context);
            expect(result).to.be.equal('../../');
        });

        it('should return ./ if depth is zero', function () {
            var template =  handlebars.compile(this.html);
            var context = {depth: 0};
            var result = template(context);
            expect(result).to.be.equal('./');
        });
    });

    describe('path_join', function () {
        it('should join arguments by slashes', function () {
            var template =  handlebars.compile('{{path_join "root" path1 path2 path3}}');
            var context = {
                path1: 'A',
                path2: 'B',
                path3: 'C'
            };
            var result = template(context);
            expect(result).to.be.equal('root/A/B/C');
        });
    });

});


