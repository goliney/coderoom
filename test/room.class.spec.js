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
                'config.json': '{"title": "from-config"}'
            },
            'Dir3': {},
            '3__File.html': 'AAA',
            'invalid.json': 'invalid-json',
            'media': {
                'styleA.css': '',
                'styleB.css': '',
                'js': {
                    'scriptA.js': '',
                    'scriptB.js': ''
                }
            }
        });
    });

    after(function () {
        mock.restore();
    });

    describe('initialization', function () {
        it('should return immediately if no source provided', function () {
            var room = new Room();
            expect(room.config).to.be.undefined;
        });

        it('should set title', function () {
            var room = new Room(pathTo('1__Dir1'));
            expect(room.config.title).to.be.equal('Dir1');

            var room = new Room(pathTo('2__Dir2'));
            expect(room.config.title).to.be.equal('from-config');

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

        beforeEach(function () {
            room = new Room('1__Dir1');
        });

        afterEach(function () {
            room = null;
        });

        describe('extendConfigFromFile', function () {
            var pathToFile;

            after(function () {
                pathToFile = null;
            });

            it('should extend config with content of JSON file', function () {
                room.config.someKey = 'some-value';
                pathToFile = pathTo('2__Dir2', 'config.json');
                room.extendConfigFromFile(pathToFile);
                expect(room.config.title).to.be.equal('from-config');
                expect(room.config.someKey).to.be.equal('some-value');
            });

            it('should not throw error if file doesn\'t exist', function () {
                var fn = function () {
                    room.extendConfigFromFile(pathToFile);
                };

                // file doesn't exist
                pathToFile = 'path/doesnt/exist/config.json';
                expect(fn).not.to.throw();

                // file is invalid
                pathToFile = pathTo('invalid.json');
                expect(fn).to.throw();
            });
        });

        describe('pushItem', function () {
            it('should push to items', function () {
                expect(room.items).to.be.empty;
                var obj = {};
                room.pushItem(obj);
                expect(room.items).to.contain(obj);
            });
        });

        describe('addFiles', function () {
            it('should take string or array and push unique to files', function () {
                var pathToFileA = 'path/to/file/A.css';
                var pathToFileB = 'path/to/file/B.css';
                expect(room.files).to.be.empty;
                // add string
                room.addFiles(pathToFileA);
                expect(room.files).to.contain(pathToFileA);
                // add array
                room.addFiles([pathToFileA, pathToFileB]);
                expect(room.files).to.contain(pathToFileA);
                expect(room.files).to.contain(pathToFileB);
                expect(room.files).length.to.be(2);
            });
        });

        describe('getMedia', function () {
            it('should ', function () {

            });
        });
    });

});

function pathTo() {
    return path.resolve.apply(null, [process.cwd(), ...arguments]);
}