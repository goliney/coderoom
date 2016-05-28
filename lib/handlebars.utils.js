"use strict";

module.exports = function (handlebars) {
    /*
     See: http://stackoverflow.com/a/11924998/1065780

     {{#times 10}}
         <span>{{this}}</span>
     {{/times}}
     */
    handlebars.registerHelper('times', function (n, block) {
        var accum = '';
        for (var i = 0; i < n; ++i) {
            accum += block.fn(i);
        }
        return accum;
    });

    /*
     {{path_to_root depth}}
     Outputs '../' `depth`-times
     */
    handlebars.registerHelper('path_to_root', function (depth) {
        return Array(depth++).join('../') || './';
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