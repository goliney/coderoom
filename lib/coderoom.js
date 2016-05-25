"use strict";

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const handlebars = require('handlebars');
const commonPathPrefix = require('common-path-prefix');
const sass = require('node-sass');

const settings = require('./settings');
const Room = require('./room.class.js');
const utils = require('./utils.js');
require('./handlebars.utils.js')(handlebars);

var sourceDir;
var targetDir;
var root;
var commonFolder;

module.exports = {
    build(source, target) {
        sourceDir = source;
        targetDir = target;
        commonFolder = '';

        fs.emptyDirSync(targetDir);

        root = planRooms(source);

        compileSCSS();
        copyStatic();
        copyMedia();

        generateHtml();
    }
};

function planRooms(sourceDir, parent) {
    var files = glob.sync('/*', {root: sourceDir, mark: true});
    var room = new Room(sourceDir);
    if (parent) {
        parent.pushItem(room);
    }
    if (files.some(file => _.endsWith(file, '/index.html'))) {
        // complex item (html, css, js)
        room.addFiles([
            path.join(sourceDir, 'index.html'),
            ...files.filter(file => _.includes(settings.supportedExt, path.parse(file).ext))
        ]);
    } else {
        // simple dir
        files.forEach(file => {
            var isDir = _.endsWith(file, '/');
            var ext = path.parse(file).ext;
            if (!isDir && ext !== '.html') {
                // ignore file which is not template
                return;
            }
            if (isDir) {
                // child directory
                planRooms(file, room);
            } else {
                // simple room (single html file)
                room.pushItem(new Room(file));
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
    var allFiles = _.uniq([...root.getMedia(), ...root.getAssets()]);
    commonFolder = commonPathPrefix(allFiles);
    allFiles.forEach(file => {
        fs.copySync(
            file,
            path.join(targetDir, 'media', path.relative(commonFolder, file))
        );
    });
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

    buildRooms(root, path.join(targetDir, 'tpls'), 2);    //depth=2, fixes path to targetDir

    function buildRooms(room, dir, depth) {
        depth++;
        room.items.forEach((item, i) => {
            var itemPath = path.join(dir, i.toString());
            fs.ensureDir(itemPath, () => {
                if (!item.hasFiles()) {
                    buildRooms(item, itemPath, depth);
                } else {
                    const snippet = fs.readFileSync(item.files[0], 'utf8');
                    // index.html
                    fs.writeFile(
                        path.join(itemPath, 'index.html'),
                        handlebars.compile(index)({
                            depth,
                            snippet,
                            settings,
                            root,
                            room: item,
                            config: item.config
                        })
                    );

                    //iframe.html
                    fs.writeFile(
                        path.join(itemPath, 'iframe.html'),
                        handlebars.compile(iframe)({
                            depth,
                            snippet,
                            settings,
                            room: item,
                            css_paths: [],
                            js_paths: []
                        })
                    );
                }
            });
        });

        // entry point index.html
        fs.writeFile(
            path.join(targetDir, 'index.html'),
            handlebars.compile(index)({
                settings,
                root,
                depth: 0
            })
        );
    }
}