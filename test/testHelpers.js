"use strict";

const path = require('path');

module.exports = {
    pathTo: function () {
        return path.resolve.apply(null, [process.cwd(), ...arguments]);
    }
};