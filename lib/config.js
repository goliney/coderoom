"use strict";

module.exports = {
    tplExt: ['.html', '.htm'],
    sass_entry: './templates/default/scss/base.scss',
    paths: {
        static: './templates/default/static',
        templates: './templates/default/tpls'
    },
    static_css: [
        'static/css/base.css'
    ],
    static_js: [
        'static/js/ace/ace.js',
        'static/js/ace/mode-html.js',
        'static/js/base.js'
    ]
};

