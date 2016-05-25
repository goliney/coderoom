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
        this.config = {};
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
                throw err; // let others bubble up
            }
        }
    }

    push(room) {
        this.items = this.items || [];
        this.items.push(room);
    }

    addFiles(newFiles) {
        this.files = this.files || [];
        newFiles = _.isArray(newFiles) ? newFiles : [newFiles];
        this.files = _.union(this.files, newFiles);
    }
};