'use strict';

const expect = require('chai').expect;
const handlebars = require('handlebars');

require('../lib/handlebars.utils.js')(handlebars);

describe('Handlebar utils', function () {
    describe('path_to_root', function () {
        before(function () {
            this.html = '{{path_to_root depth}}';
        });
        
        it('should return ../ depth-times', function () {
            let template =  handlebars.compile(this.html);
            let context = {depth: 3};
            let result = template(context);
            expect(result).to.be.equal('../../');
        });

        it('should return ./ if depth is zero', function () {
            let template =  handlebars.compile(this.html);
            let context = {depth: 0};
            let result = template(context);
            expect(result).to.be.equal('./');
        });
    });

    describe('path_join', function () {
        it('should join arguments by slashes', function () {
            let template =  handlebars.compile('{{path_join "root" path1 path2 path3}}');
            let context = {
                path1: 'A',
                path2: 'B',
                path3: 'C',
            };
            let result = template(context);
            expect(result).to.be.equal('root/A/B/C');
        });
    });

});


