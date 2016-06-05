"use strict";

module.exports = function (handlebars) {
    /*
     {{path_to_root depth}}
     Outputs '../' `depth`-times
     */
    handlebars.registerHelper('path_to_root', function (depth) {
        return Array(depth).join('../') || './';
    });

    /*
     {{path_join 'path' @index}}
     */
    handlebars.registerHelper('path_join', function () {
        var paths = Array.prototype.slice.call(arguments);
        paths.pop();    // remove 'options' hash
        return paths.join('/');
    });
};