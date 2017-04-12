'use strict';

module.exports = {
    supportedExt: ['.css', '.js'],
    // relatively to 'lib' folder
    sass_entry: './templates/default/scss/base.scss',
    paths: {
        static: './templates/default/static',
        templates: './templates/default/tpls',
    },
    static_css: [
        'static/font-awesome-4.6.3/css/font-awesome.min.css',
        'static/css/base.css',
    ],
    static_js: [
        'static/js/vendor/ace/ace.js',
        'static/js/vendor/ace/mode-html.js',
        'static/js/vendor/jquery-2.2.3.min.js',
        'static/js/vendor/vue-2.2.0.min.js',
        'static/js/base.js',
        'static/js/editor.js',
        'static/js/search.js',
    ],
};

