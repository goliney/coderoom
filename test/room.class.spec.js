"use strict";

var expect = require('chai').expect;
const mock = require('mock-fs');
const path = require('path');

const Room = require('../lib/room.class.js');

describe('Room class', function () {
    before(function () {
        mock({
            '1__Dir1': {},
            '2__Dir2': {
                'config.json': '{"title": "From config"}'
            },
            'Dir3': {},
            '3__File.html': 'AAA',
            'invalid.json': 'invalid-json'
        });
    });

    after(function () {
        mock.restore();
    });

    describe('initialization', function () {
        it('should set title', function () {
            var room = new Room(pathTo('1__Dir1'));
            expect(room.config.title).to.be.equal('Dir1');

            var room = new Room(pathTo('2__Dir2'));
            expect(room.config.title).to.be.equal('From config');

            var room = new Room(pathTo('Dir3'));
            expect(room.config.title).to.be.equal('Dir3');

            var room = new Room(pathTo('3__File.html'));
            expect(room.config.title).to.be.equal('File');
        });

        it('should extend "files" in case of html as an input', function () {
            var pathToHtml = pathTo('3__File.html');
            var room = new Room(pathToHtml);
            expect(room.files).to.contain(pathToHtml);
        });
    });

    describe('method', function () {
        var room;

        before(function () {
            room = new Room();
        });

        describe('extendConfigFromFile', function () {
            it('should not throw error if file doesn\'t exist', function () {
                var pathToFile;
                var fn = function () {
                    room.extendConfigFromFile(pathToFile);
                };

                // file exists and is valid
                pathToFile = pathTo('2__Dir2', 'config.json');
                expect(fn).not.to.throw();

                // file doesn't exist
                pathToFile = 'path/doesnt/exist/config.json';
                expect(fn).not.to.throw();

                // file is invalid
                pathToFile = pathTo('invalid.json');
                expect(fn).to.throw();
            });
        });

    });

});

function pathTo() {
    return path.resolve.apply(null, [process.cwd(), ...arguments]);
}