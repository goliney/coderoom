"use strict";

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const handlebars = require('handlebars');
const commonPathPrefix = require('common-path-prefix');
const sass = require('node-sass');

const config = require('./config');

require('./handlebars_helpers')(handlebars);

var options;
var structure;
var commonMediaPath;

module.exports = {
    build(source, target, buildOptions) {
        options = {};
        structure = [];
        commonMediaPath = '';

        prepareOptions(source, target, buildOptions);

        parseSource(source);

        fs.emptyDirSync(options.target);

        compileSCSS();
        copyStatic();
        copyMedia();

        generateHtml();
    }
};

function prepareOptions(source, target, buildOptions) {
    options = _.defaultsDeep(
        {source, target},
        buildOptions,
        fs.readJsonSync(path.join(source, 'options.json')),
        options
    );
}

function compileSCSS() {
    var css_dir = path.resolve(__dirname, config.paths.static, 'css');
    var result = sass.renderSync({
        file: path.resolve(__dirname, config.sass_entry),
        outputStyle: 'compressed',
        //outFile: outFile,
        sourceMap: true
    });
    fs.writeFileSync(path.join(css_dir, 'base.css'), result.css);
    fs.writeFileSync(path.join(css_dir, 'base.css.map'), result.css);
}

function copyStatic() {
    fs.copySync(
        path.resolve(__dirname, config.paths.static),
        path.join(options.target, 'static')
    );
}

function copyMedia() {
    var css_files = [];
    var js_files = [];
    var media_files = [];

    _.each(options.css, pattern => {
        css_files.push(...glob.sync(pattern, {mark: true, realpath: true}));
    });
    _.each(options.js, pattern => {
        js_files.push(...glob.sync(pattern, {mark: true, realpath: true}));
    });
    _.each(options.media, pattern => {
        media_files.push(...glob.sync(pattern, {mark: true, realpath: true}));
    });

    var allFiles = [...css_files, ...js_files, ...media_files];
    commonMediaPath = commonPathPrefix(allFiles);

    _.each(allFiles, file => {
        fs.copySync(
            file,
            path.join(options.target, 'media', file.slice(commonMediaPath.length))
        );
    });

    options.css = css_files.map(file => 'media/' + path.resolve(file).slice(commonMediaPath.length));
    options.js = js_files.map(file => 'media/' + path.resolve(file).slice(commonMediaPath.length));
}

function parseSource(source, parent) {
    var files = glob.sync('/*', {root: source, mark: true});
    _.each(files, file => {
        var isDir = _.endsWith(file, '/');
        var details = path.parse(file);
        if (!isDir && !_.includes(config.tplExt, details.ext)) {
            // ignore file which is not template
            return;
        }
        var item = {
            isDir,
            name: _.tail(details.name.split('__')).join('__') || details.name,
            path: file
        };
        if (item.isDir) {
            item.items = [];
            parseSource(file, item);
        }
        (parent ? parent.items : structure).push(item);
    });
}

function generateHtml() {
    const index = fs.readFileSync(path.resolve(__dirname, config.paths.templates, 'index.html'), 'utf8');
    const iframe = fs.readFileSync(path.resolve(__dirname, config.paths.templates, 'iframe.html'), 'utf8');

    // partial templates
    const menu = fs.readFileSync(path.resolve(__dirname, config.paths.templates, 'partials', 'menu.html'), 'utf8');
    const head_extra = fs.readFileSync(path.resolve(__dirname, config.paths.templates, 'partials', 'head_extra.html'), 'utf8');
    const body_extra = fs.readFileSync(path.resolve(__dirname, config.paths.templates, 'partials', 'body_extra.html'), 'utf8');
    const op_menu = fs.readFileSync(path.resolve(__dirname, config.paths.templates, 'partials', 'operational_menu.html'), 'utf8');
    handlebars.registerPartial('menu', menu);
    handlebars.registerPartial('head_extra', head_extra);
    handlebars.registerPartial('body_extra', body_extra);
    handlebars.registerPartial('op_menu', op_menu);

    buildItems(structure, path.join(options.target, 'tpls'), 2);    //depth=2, fixes path to root

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
                            depth, item, config, snippet, options,
                            items: structure
                        })
                    );

                    //iframe.html
                    fs.writeFile(
                        path.join(itemPath, 'iframe.html'),
                        handlebars.compile(iframe)({
                            depth, item, config, snippet,
                            css_paths: options.css,
                            js_paths: options.js
                        })
                    );
                }
            });
        });

        // entry point index.html
        fs.writeFile(
            path.join(options.target, 'index.html'),
            handlebars.compile(index)({
                config, options,
                depth: 0,
                items: structure
            })
        );
    }
}