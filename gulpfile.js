"use strict";

const gulp = require('gulp');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const shell = require('gulp-shell');
const runSequence = require('run-sequence').use(gulp);

const coderoom = require('./lib/coderoom');

const files = {
    src: {
        all: [
            './lib/**/*',
            '!./lib/**/*.css',
            '!./lib/**/*.css.map'
        ],
        js: ['./lib/**/*.js'],
        gulpfile: './gulpfile.js'
    },
    example: {
        all: [
            './example/**/*',
            '!./example/coderoom/build/**/*'
        ]
    }
};

gulp.task('default', ['buildExample', 'watch']);

gulp.task('buildExample', shell.task([
    'node ./bin/coderoom ./example/coderoom/src ./example/coderoom/build/'
]));

gulp.task('jshint', () => {
    return gulp.src([...files.src.js, files.src.gulpfile, '!**/vendor/**/*'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('watch', () => {
    gulp.watch([...files.src.js, files.src.gulpfile], ['jshint']);
    gulp.watch(files.src.all, ['buildExample']);
    gulp.watch(files.example.all, ['buildExample']);
});