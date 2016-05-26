"use strict";

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');

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

    hasFiles() {
        return this.files && this.files.length > 0;
    }

    getMedia(deep) {
        var media = Room.parseFilePatterns(this.config.media);
        if (deep !== false) {
            media = _.concat(media, _.flatMap(this.items, item => item.getMedia()));
        }
        return media;
    }

    getAssets(deep) {
        var assets = Room.parseFilePatterns(this.config.assets);
        if (deep !== false) {
            assets = _.concat(assets, _.flatMap(this.items, item => item.getAssets()));
        }
        return assets;
    }

    static parseFilePatterns(patterns) {
        patterns = _.isArray(patterns) ? patterns : [patterns];
        return _.flatMap(patterns,
            pattern => glob.sync(pattern, {mark: true, realpath: true})
        );
    }
};