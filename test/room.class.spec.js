"use strict";

const expect = require('chai').expect;
const mock = require('mock-fs');
const path = require('path');
const testHelpers = require('./testHelpers');

const Room = require('../lib/room.class.js');

describe('Room class', function () {
    before(function () {
        mock({
            // for initialization and stuff
            '1__Room1': {},
            '2__Room2': {
                'config.json': '{"title": "from-config"}'
            },
            'Room3': {},
            '4__FileRoom.html': 'AAA',
            'invalid.json': 'invalid-json',

            // for rooms with resources
            'Room5': {
                'config.json': `{
                    "media": [
                        "./project/*B.css",
                        "./project/**/*.js"
                    ],
                    "assets": [
                        "./project/assets/*B.png",
                        "./project/assets/**/*.ttf"
                    ]
                }`
            },
            'Room6': {
                'config.json': `{
                    "media": [
                        "./project/**/*.css",
                        "./project/js/scriptA.js"
                    ],
                    "assets": "./project/assets/**/*"
                }`
            },
            'project': {
                'styleA.css': '',
                'styleB.css': '',
                'js': {
                    'scriptB.js': '',
                    'scriptA.js': ''
                },
                'assets': {
                    'imageA.png': '',
                    'imageB.png': '',
                    'fonts': {
                        'fontB.ttf': '',
                        'fontA.ttf': ''
                    }
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
            var room = new Room('1__Room1');
            expect(room.config.title).to.be.equal('Room1');

            var room = new Room('2__Room2');
            expect(room.config.title).to.be.equal('from-config');

            var room = new Room('Room3');
            expect(room.config.title).to.be.equal('Room3');

            var room = new Room('4__FileRoom.html');
            expect(room.config.title).to.be.equal('FileRoom');
        });

        it('should extend "files" in case of html was provided as an input', function () {
            var pathToHtml = '4__FileRoom.html';
            var room = new Room(pathToHtml);
            expect(room.files).to.contain(pathToHtml);
        });

        it('should not extend "files" in case of not html file was provided as an input', function () {
            var pathToFile = 'invalid.json';
            var room = new Room(pathToFile);
            expect(room.files).not.to.contain(pathToFile);
        });
    });

    describe('method', function () {
        var room;

        beforeEach(function () {
            room = new Room('1__Room1');
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
                pathToFile = '2__Room2/config.json';
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
                pathToFile = 'invalid.json';
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
                expect(room.files).to.have.lengthOf(2);
            });
        });

        describe('which parses resources', function () {
            var room5;
            var room6;

            beforeEach(function () {
                room5 = new Room('Room5');
                room6 = new Room('Room6');
                room5.pushItem(room6);
            });

            afterEach(function () {
                room5 = null;
                room6 = null;
            });

            describe('getMedia', function () {
                it('should gather media files recursively by default', function () {
                    var media = room5.getMedia();
                    expect(media).to.eql([
                        testHelpers.pathTo('project', 'styleB.css'),
                        testHelpers.pathTo('project', 'js', 'scriptA.js'),
                        testHelpers.pathTo('project', 'js', 'scriptB.js'),
                        testHelpers.pathTo('project', 'styleA.css')
                    ])
                });

                it('should gather only room\'s media if applied with `false` parameter', function () {
                    var media = room5.getMedia(false);
                    expect(media).to.eql([
                        testHelpers.pathTo('project', 'styleB.css'),
                        testHelpers.pathTo('project', 'js', 'scriptA.js'),
                        testHelpers.pathTo('project', 'js', 'scriptB.js')
                    ])
                });
            });

            describe('getAssets', function () {
                it('should gather assets recursively by default', function () {
                    var media = room5.getAssets();
                    expect(media).to.eql([
                        testHelpers.pathTo('project', 'assets', 'imageB.png'),
                        testHelpers.pathTo('project', 'assets', 'fonts', 'fontA.ttf'),
                        testHelpers.pathTo('project', 'assets', 'fonts', 'fontB.ttf'),
                        testHelpers.pathTo('project', 'assets', 'imageA.png')
                    ])
                });

                it('should gather only room\'s assets if applied with `false` parameter', function () {
                    var media = room5.getAssets(false);
                    expect(media).to.eql([
                        testHelpers.pathTo('project', 'assets', 'imageB.png'),
                        testHelpers.pathTo('project', 'assets', 'fonts', 'fontA.ttf'),
                        testHelpers.pathTo('project', 'assets', 'fonts', 'fontB.ttf')
                    ])
                });
            });
        });
    });

    describe('getter', function () {
        var room;

        beforeEach(function () {
            room = new Room('1__Room1');
        });

        afterEach(function () {
            room = null;
        });

        describe('hasFiles', function () {
            it('should check if room has files', function () {
                expect(room.hasFiles).to.be.false;
                room.addFiles('someFile.txt');
                expect(room.hasFiles).to.be.true;
            });
        });

        describe('hasHTML', function () {
            it('should check if room has html files', function () {
                expect(room.hasHTML).to.be.false;
                room.addFiles('someHtml.html');
                expect(room.hasHTML).to.be.true;
            });
        });

        describe('hasCSS', function () {
            it('should check if room has css files', function () {
                expect(room.hasCSS).to.be.false;
                room.addFiles('someCss.css');
                expect(room.hasCSS).to.be.true;
            });
        });

        describe('hasJS', function () {
            it('should check if room has js files', function () {
                expect(room.hasJS).to.be.false;
                room.addFiles('someJs.js');
                expect(room.hasJS).to.be.true;
            });
        });

        describe('which return parsed files', function () {
            beforeEach(function () {
                room.addFiles([
                    'someHtml.html',
                    'someCss.css',
                    'someJs.js'
                ]);
            });

            describe('parsedFiles', function () {
                it('should return all parsed files', function () {
                    room.parsedFiles.forEach(parsedFile => {
                        expect(parsedFile).to.have.all.keys('file', 'parse', 'active', 'normalized', 'title')
                    });
                    expect(room.parsedFiles).to.have.lengthOf(3);
                });
            });

            describe('parsedHTMLFiles', function () {
                it('should return all parsed html files', function () {
                    room.parsedHTMLFiles.forEach(parsedFile => {
                        expect(parsedFile).to.have.all.keys('file', 'parse', 'active', 'normalized', 'title')
                    });
                    expect(room.parsedHTMLFiles).to.have.lengthOf(1);
                    expect(room.parsedHTMLFiles[0].parse.ext).to.be.equal('.html');
                });
            });

            describe('parsedCSSFiles', function () {
                it('should return all parsed html files', function () {
                    room.parsedCSSFiles.forEach(parsedFile => {
                        expect(parsedFile).to.have.all.keys('file', 'parse', 'active', 'normalized', 'title')
                    });
                    expect(room.parsedCSSFiles).to.have.lengthOf(1);
                    expect(room.parsedCSSFiles[0].parse.ext).to.be.equal('.css');
                });
            });

            describe('parsedJSFiles', function () {
                it('should return all parsed html files', function () {
                    room.parsedJSFiles.forEach(parsedFile => {
                        expect(parsedFile).to.have.all.keys('file', 'parse', 'active', 'normalized', 'title')
                    });
                    expect(room.parsedJSFiles).to.have.lengthOf(1);
                    expect(room.parsedJSFiles[0].parse.ext).to.be.equal('.js');
                });
            });
        });

    });

});