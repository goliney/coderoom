"use strict";

const expect = require('chai').expect;
const mock = require('mock-fs');
const path = require('path');
const fs = require('fs-extra');
const testHelpers = require('./testHelpers');

const coderoom = require('../lib/coderoom');

describe('Coderoom', function () {
    before(function () {
        mock({
            // lib files
            'lib/templates/default/static/css/base.css': '',
            'lib/templates/default/tpls/index.html': '',
            'lib/templates/default/tpls/iframe.html': `
                {{> head_extra with css_paths=css_paths depth=depth}}
                {{> body_extra with js_paths=js_paths depth=depth}}`,
            'lib/templates/default/tpls/partials/menu.html': '',
            'lib/templates/default/tpls/partials/head_extra.html': `
                {{#each css_paths as |path|}}
                    {{path_to_root ../depth}}{{path}}
                {{/each}}`,
            'lib/templates/default/tpls/partials/body_extra.html': `
                {{#each js_paths as |path|}}
                    {{path_to_root ../depth}}{{path}}
                {{/each}}`,
            'lib/templates/default/tpls/partials/operations.html': '',
            // test project media
            'myProject': {
                'css': {
                    'A.css': '',
                    'B.css': '',
                    'C.css': '',
                    'shared.css': ''
                },
                'js': {
                    'A.js': '',
                    'B.js': '',
                    'C.js': '',
                    'shared.js': ''
                },
                'img': {
                    'A.png': '',
                    'B.png': '',
                    'C.png': '',
                    'logo.png': ''
                }
            },
            // input
            'source': {
                'SingleFile': {
                    'File.html': 'simple-file'
                },
                'WithResources': {
                    'Parent': {
                        'config.json': `{
                            "media": ["./myProject/js/A*", "./myProject/css/A*"],
                            "assets": "./myProject/img/A*"
                        }`,
                        'A.html': '',
                        'ChildGroup': {
                            'B.html': '',
                            'config.json': `{
                                "media": ["./myProject/js/B*", "./myProject/css/B*"],
                                "assets": "./myProject/img/B*"
                            }`,
                            'C_Room': {
                                'index.html': '',
                                'app.js': '',
                                'config.json': `{
                                    "title": "C",
                                    "media": ["./myProject/js/C*", "./myProject/css/C*"],
                                    "assets": "./myProject/img/C*"
                                }`
                            }
                        }
                    },
                    'config.json': `{
                        "media": ["./myProject/js/shared.js", "./myProject/css/shared.css"],
                        "assets": "./myProject/img/logo.png"
                    }`
                },
                'WithoutHtml': {
                    'index.txt': ''
                },
                'Groups': {
                    '1__One': {
                        'index.html': ''
                    },
                    '1__Two': {
                        'index.html': ''
                    },
                    '3__Three': {
                        'Five': {
                            'index.html': ''
                        },
                        'Four': {
                            'index.html': ''
                        }
                    }
                }
            },
            // output
            'target': {}
        });
    });

    after(function () {
        mock.restore();
    });

    it('should create simple presentation', function () {
        coderoom.build('./source/SingleFile', './target');

        var targetDir = fs.readdirSync('target');
        expect(targetDir).to.contain('index.html');

        var roomDir = fs.readdirSync('target/tpls/0');
        expect(roomDir).to.contain.members(['iframe.html', 'index.html']);
    });

    it('should copy static', function () {
        coderoom.build('./source/SingleFile', './target');

        var cssDir = fs.readdirSync('target/static/css');
        expect(cssDir).to.contain('base.css');
    });

    it('should copy resources', function () {
        coderoom.build('./source/WithResources', './target');

        var jsDir = fs.readdirSync('target/media/js');
        expect(jsDir).to.contain.members(['A.js', 'B.js', 'shared.js']);

        var cssDir = fs.readdirSync('target/media/css');
        expect(cssDir).to.contain.members(['A.css', 'B.css', 'shared.css']);

        var imgDir = fs.readdirSync('target/media/img');
        expect(imgDir).to.contain.members(['A.png', 'B.png', 'logo.png']);
    });

    it('should inherit media', function () {
        coderoom.build('./source/WithResources', './target');

        var iframeA = fs.readFileSync('target/tpls/0/0/iframe.html', 'utf8');
        expect(iframeA).to.contain('shared.js');
        expect(iframeA).to.contain('A.js');
        expect(iframeA).not.to.contain('B.js');
        expect(iframeA).not.to.contain('C.js');

        var iframeB = fs.readFileSync('target/tpls/0/1/0/iframe.html', 'utf8');
        expect(iframeB).to.contain('shared.js');
        expect(iframeB).to.contain('A.js');
        expect(iframeB).to.contain('B.js');
        expect(iframeB).not.to.contain('C.js');

        var iframeC = fs.readFileSync('target/tpls/0/1/1/iframe.html', 'utf8');
        expect(iframeC).to.contain('shared.js');
        expect(iframeC).to.contain('A.js');
        expect(iframeC).to.contain('B.js');
        expect(iframeC).to.contain('C.js');
    });

    it('should ignore rooms without html', function () {
        coderoom.build('./source/WithoutHtml', './target');

        var targetDir = fs.readdirSync('target');
        expect(targetDir).not.to.contain('tpls');
    });

    it('should group rooms', function () {
        coderoom.build('./source/Groups', './target');

        var tplsDir = fs.readdirSync('target/tpls');
        expect(tplsDir).to.contain.members(['0', '1', '2']);
        expect(tplsDir).not.to.contain('3');

        // deep group
        tplsDir = fs.readdirSync('target/tpls/2');
        expect(tplsDir).to.contain.members(['0', '1']);
        expect(tplsDir).not.to.contain('2');
    });
});


