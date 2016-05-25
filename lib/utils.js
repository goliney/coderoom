"use strict";

module.exports = {
    normalizeName
};

/**
 * Split name by double underscore and remove first part
 * @param name
 * @returns {string|*}
 */
function normalizeName(name) {
    return name.split('__').slice(1).join('__') || name;
}