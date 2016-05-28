"use strict";

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const handlebars = require('handlebars');
const commonPathPrefix = require('common-path-prefix');
const normalizePath = require('normalize-path');
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
    const index = utils.readTemplate('index.html');
    const iframe = utils.readTemplate('iframe.html');

    // partial templates
    const menu = utils.readTemplate('partials', 'menu.html');
    const head_extra = utils.readTemplate('partials', 'head_extra.html');
    const body_extra = utils.readTemplate('partials', 'body_extra.html');
    const operations = utils.readTemplate('partials', 'operations.html');
    handlebars.registerPartial('menu', menu);
    handlebars.registerPartial('head_extra', head_extra);
    handlebars.registerPartial('body_extra', body_extra);
    handlebars.registerPartial('operations', operations);

    buildRooms(root, path.join(targetDir, 'tpls'), 2, []);    //depth=2, fixes path to targetDir

    function buildRooms(baseRoom, dir, depth, attachments) {
        depth++;
        
        attachments = _.chain(attachments)
            .clone()
            .concat(baseRoom.getMedia(false).map(file => path.join('media', path.relative(commonFolder, file))))
            .uniq()
            .value();
        
        baseRoom.items.forEach((room, i) => {
            var itemPath = path.join(dir, i.toString());
            fs.ensureDir(itemPath, () => {
                if (!room.hasFiles) {
                    buildRooms(room, itemPath, depth, attachments);
                } else {
                    const roomsFiles = room.parsedFiles.map(file => {
                        file.destination = path.join(itemPath, 'files', file.parse.base);
                        file.content = fs.readFileSync(file.file, 'utf8');
                        file.mode = file.parse.ext.replace('.', '');
                        fs.copySync(file.file, file.destination);
                        return file;
                    });

                    const css_paths = _.chain(attachments)
                        .concat(roomsFiles.map(file => path.relative(targetDir, file.destination)))
                        .filter(file => _.endsWith(file, '.css'))
                        .map(file => normalizePath(file, false))
                        .value();

                    const js_paths = _.chain(attachments)
                        .concat(roomsFiles.map(file => path.relative(targetDir, file.destination)))
                        .filter(file => _.endsWith(file, '.js'))
                        .map(file => normalizePath(file, false))
                        .value();

                    // iframe.html
                    fs.writeFile(
                        path.join(itemPath, 'iframe.html'),
                        handlebars.compile(iframe)({
                            depth,
                            css_paths,
                            js_paths,
                            html: roomsFiles[0]
                        })
                    );

                    // index.html
                    fs.writeFile(
                        path.join(itemPath, 'index.html'),
                        handlebars.compile(index)({
                            depth,
                            roomsFiles,
                            settings,
                            root,
                            room,
                            css_paths,
                            js_paths
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
                config: root.config,
                depth: 0
            })
        );
    }
}