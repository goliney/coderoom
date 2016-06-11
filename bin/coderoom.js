#!/usr/bin/env node
'use strict';

const coderoom = require('../lib/coderoom');
const program = require('commander');
const path = require('path');

program
    .arguments('<source_dir> [target_dir]')
    .action(function (source_dir, target_dir) {
        source_dir = path.resolve(source_dir);
        target_dir = target_dir ?
            path.resolve(target_dir) :
            path.resolve(source_dir, '../coderoom/');
        console.log('Building coderoom into', target_dir);
        coderoom.build(source_dir, target_dir);
    })
    .parse(process.argv);