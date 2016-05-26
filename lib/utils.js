"use strict";

const fs = require('fs-extra');
const path = require('path');

const settings = require('./settings');

module.exports = {
    normalizeName,
    readTemplate
};

/**
 * Split name by double underscore and remove first part
 * @param name
 * @returns {string|*}
 */
function normalizeName(name) {
    return name.split('__').slice(1).join('__') || name;
}

/**
 * Synchronously read file from templates folder.
 * @param {...string} variative number of paths that form relative path to template
 * @returns {string}
 */
function readTemplate() {
    return fs.readFileSync(path.resolve.apply(null, [__dirname, settings.paths.templates, ...arguments]), 'utf8');
}