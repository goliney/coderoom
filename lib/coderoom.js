"use strict";

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const handlebars = require('handlebars');
const commonPathPrefix = require('common-path-prefix');
const sass = require('node-sass');

const settings = require('./settings');
const Room = require('./Room.class.js');
const utils = require('./utils.js');
require('./handlebars.utils.js')(handlebars);

var sourceDir;
var targetDir;
var config;
var structure;
var commonMediaPath;

module.exports = {
    build(source, target) {
        sourceDir = source;
        targetDir = target;
        config = {};
        structure = [];
        commonMediaPath = '';

        fs.emptyDirSync(targetDir);

        structure = buildRooms(source);

        compileSCSS();
        copyStatic();
        //copyMedia();
        //
        //generateHtml();
    }
};

function buildRooms(sourceDir, parent) {
    var files = glob.sync('/*', {root: sourceDir, mark: true});
    var room = new Room(sourceDir);
    if (parent) {
        parent.push(room);
    }
    if (files.some(file => _.endsWith(file, '/index.html'))) {
        // complex item (html, css, js)
        room.addFiles([
            path.join(sourceDir, 'index.html'),
            ...files.filter(file => _.includes(settings.supportedExt, path.parse(file).ext))
        ]);
    } else {
        // simple dir
        _.each(files, file => {
            var isDir = _.endsWith(file, '/');
            var ext = path.parse(file).ext;
            if (!isDir && ext !== '.html') {
                // ignore file which is not template
                return;
            }
            if (isDir) {
                // child directory
                buildRooms(file, room);
            } else {
                // simple room (single html file)
                room.push(new Room(file));
            }
        });
    }
    return room;
}

function compileSCSS() {
    var css_dir = path.resolve(__dirname, settings.paths.static, 'css');
    var result = sass.renderSync({
        file: path.resolve(__dirname, settings.sass_entry),
        outputStyle: 'compressed',
        sourceMap: true
    });
    fs.writeFileSync(path.join(css_dir, 'base.css'), result.css);
    fs.writeFileSync(path.join(css_dir, 'base.css.map'), result.css);
}

function copyStatic() {
    fs.copySync(
        path.resolve(__dirname, settings.paths.static),
        path.join(targetDir, 'static')
    );
}

function copyMedia() {
    var css_files = [];
    var js_files = [];
    var media_files = [];

    _.each(config.css, pattern => {
        css_files.push(...glob.sync(pattern, {mark: true, realpath: true}));
    });
    _.each(config.js, pattern => {
        js_files.push(...glob.sync(pattern, {mark: true, realpath: true}));
    });
    _.each(config.media, pattern => {
        media_files.push(...glob.sync(pattern, {mark: true, realpath: true}));
    });

    var allFiles = [...css_files, ...js_files, ...media_files];
    commonMediaPath = commonPathPrefix(allFiles);

    _.each(allFiles, file => {
        fs.copySync(
            file,
            path.join(targetDir, 'media', file.slice(commonMediaPath.length))
        );
    });

    config.css = css_files.map(file => 'media/' + path.resolve(file).slice(commonMediaPath.length).replace(/\\/g, '/'));
    config.js = js_files.map(file => 'media/' + path.resolve(file).slice(commonMediaPath.length).replace(/\\/g, '/'));
}

function generateHtml() {
    const index = fs.readFileSync(path.resolve(__dirname, settings.paths.templates, 'index.html'), 'utf8');
    const iframe = fs.readFileSync(path.resolve(__dirname, settings.paths.templates, 'iframe.html'), 'utf8');

    // partial templates
    const menu = fs.readFileSync(path.resolve(__dirname, settings.paths.templates, 'partials', 'menu.html'), 'utf8');
    const head_extra = fs.readFileSync(path.resolve(__dirname, settings.paths.templates, 'partials', 'head_extra.html'), 'utf8');
    const body_extra = fs.readFileSync(path.resolve(__dirname, settings.paths.templates, 'partials', 'body_extra.html'), 'utf8');
    const op_menu = fs.readFileSync(path.resolve(__dirname, settings.paths.templates, 'partials', 'operational_menu.html'), 'utf8');
    handlebars.registerPartial('menu', menu);
    handlebars.registerPartial('head_extra', head_extra);
    handlebars.registerPartial('body_extra', body_extra);
    handlebars.registerPartial('op_menu', op_menu);

    buildItems(structure, path.join(targetDir, 'tpls'), 2);    //depth=2, fixes path to root

    function buildItems(items, dir, depth) {
        depth++;
        _.each(items, (item, i) => {
            var itemPath = path.join(dir, String(i));
            fs.ensureDir(itemPath, () => {
                if (item.isDir) {
                    buildItems(item.items, itemPath, depth);
                } else {
                    const snippet = fs.readFileSync(item.path, 'utf8');
                    // index.html
                    fs.writeFile(
                        path.join(itemPath, 'index.html'),
                        handlebars.compile(index)({
                            depth, item, settings, snippet, config,
                            items: structure
                        })
                    );

                    //iframe.html
                    fs.writeFile(
                        path.join(itemPath, 'iframe.html'),
                        handlebars.compile(iframe)({
                            depth, item, settings, snippet,
                            css_paths: config.css,
                            js_paths: config.js
                        })
                    );
                }
            });
        });

        // entry point index.html
        fs.writeFile(
            path.join(targetDir, 'index.html'),
            handlebars.compile(index)({
                settings, config,
                depth: 0,
                items: structure
            })
        );
    }
}