'use strict';

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const normalizePath = require('normalize-path');

const utils = require('./utils.js');

module.exports = class Room {
    constructor(source) {
        if (!source) {
            return;
        }
        this.files = [];
        this.items = [];
        this.config = {
            title: '',
            assets: [],
            media: []
        };
        this.parse = path.parse(source);
        this.stat = fs.statSync(source);
        this.config.title = utils.normalizeName(this.parse.name);

        if (this.stat.isDirectory()) {
            this.extendConfigFromFile(path.join(source, 'config.json'));
        } else if (this.parse.ext === '.html') {
            this.addFiles(source);
        }
    }

    extendConfigFromFile(filePath) {
        try {
            _.extend(this.config, fs.readJsonSync(filePath));
        } catch (err) {
            if (err.code === 'ENOENT') {
                // no such file or directory
            } else {
                throw err; // let other errors bubble up
            }
        }
    }

    pushItem(room) {
        this.items.push(room);
    }

    addFiles(newFiles) {
        newFiles = _.isArray(newFiles) ? newFiles : [newFiles];
        this.files = _.union(this.files, newFiles);
    }

    getMedia(deep) {
        let media = Room.parseFilePatterns(this.config.media);
        if (deep !== false) {
            media = _.union(media, _.flatMap(this.items, item => item.getMedia()));
        }
        return media;
    }

    getAssets(deep) {
        let assets = Room.parseFilePatterns(this.config.assets);
        if (deep !== false) {
            assets = _.union(assets, _.flatMap(this.items, item => item.getAssets()));
        }
        return assets;
    }

    get hasFiles() {
        return this.files.length > 0;
    }

    get hasHTML() {
        return this.parsedHTMLFiles.length > 0;
    }

    get hasCSS() {
        return this.parsedCSSFiles.length > 0;
    }

    get hasJS() {
        return this.parsedJSFiles.length > 0;
    }

    get parsedHTMLFiles() {
        return this.parsedFiles.filter(file => file.parse.ext === '.html');
    }

    get parsedCSSFiles() {
        return this.parsedFiles.filter(file => file.parse.ext === '.css');
    }

    get parsedJSFiles() {
        return this.parsedFiles.filter(file => file.parse.ext === '.js');
    }

    get parsedFiles() {
        return this.files.map((file, index) => {
            let parse = path.parse(file);
            return {
                file,
                parse,
                active: index === 0,
                normalized: normalizePath(file),
                title: utils.normalizeName(parse.base)
            };
        });
    }

    static parseFilePatterns(patterns) {
        patterns = _.isArray(patterns) ? patterns : [patterns];
        return patterns.reduce((acc, pattern) => {
            // we need flat array without folder paths
            glob.sync(pattern, {realpath: true}).forEach(file => {
                if (fs.statSync(file).isFile()) {
                    acc.push(file);
                }
            });

            return acc;
        }, []);
    }
};