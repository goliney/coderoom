"use strict";

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const handlebars = require('handlebars');
const commonPathPrefix = require('common-path-prefix');
const normalize = require('normalize-path');
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
    const op_menu = utils.readTemplate('partials', 'operational_menu.html');
    handlebars.registerPartial('menu', menu);
    handlebars.registerPartial('head_extra', head_extra);
    handlebars.registerPartial('body_extra', body_extra);
    handlebars.registerPartial('op_menu', op_menu);

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
                if (!room.hasFiles()) {
                    buildRooms(room, itemPath, depth, attachments);
                } else {
                    // copy room's files
                    var roomsFiles = [];    // relative paths to room's files
                    room.files.slice(1).forEach(file => {
                        var fileDestination = path.join(itemPath, 'files', path.parse(file).base);
                        roomsFiles.push(fileDestination);
                        fs.copySync(file, fileDestination);
                    });

                    // index.html
                    const snippet = fs.readFileSync(room.files[0], 'utf8');
                    fs.writeFile(
                        path.join(itemPath, 'index.html'),
                        handlebars.compile(index)({
                            depth,
                            snippet,
                            settings,
                            root,
                            config: room.config
                        })
                    );

                    // iframe.html
                    fs.writeFile(
                        path.join(itemPath, 'iframe.html'),
                        handlebars.compile(iframe)({
                            depth,
                            snippet,
                            css_paths: _.chain(attachments)
                                .concat(roomsFiles.map(file => path.relative(targetDir, file)))
                                .filter(file => _.endsWith(file, '.css'))
                                .map(file => normalize(file, false))
                                .value()
                            ,
                            js_paths: _.chain(attachments)
                                .concat(roomsFiles.map(file => path.relative(targetDir, file)))
                                .filter(file => _.endsWith(file, '.js'))
                                .map(file => normalize(file, false))
                                .value()
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