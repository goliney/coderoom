# Coderoom [![Build Status](https://travis-ci.org/goliney/coderoom.svg?branch=master)](https://travis-ci.org/goliney/coderoom)  [![codecov coverage](https://img.shields.io/codecov/c/github/goliney/coderoom.svg)](https://codecov.io/github/goliney/coderoom)

![Screenshot](./screenshot.jpg?raw=true "Coderoom")


## About
Coderoom helps you build live presentation of your numerous html/css/js code snippets.

For instance, you have a project with specific GUI-guidelines, custom widgets, tricky workarounds, which you want
to share with your team or customers. With coderoom you can easily gather these pieces into single resource. Also,
thanks to coderoom, you can monitor how changes in project influence it's specific parts that you have allocated.

## Demo
- [Coderoom for Bootstrap](http://goliney.github.io/coderoom-demo-bootstrap/) ([source](https://github.com/goliney/coderoom-demo-bootstrap))

## Features
- works offline
- builds live examples that are easy to use and share
- uses folder structure to arrange things
- resource nesting (child "room" inherits configuration of it's parent)

## Installation
```sh
npm install coderoom -g
```

## Usage
To generate coderoom you have to prepare a folder with at least one html file. Then run a command:
```sh
coderoom source/ target/
```

If you use coderoom as a dependency:

```javascript
const coderoom = require('coderoom');
coderoom.build('source/', 'target/');
```

Now `target` folder contains `index.html`. Open it in browser to see your built `coderoom`.

### Grouping
You can group your snippets. To do that just place them in a separate folder inside of your `source` folder.

### Ordering
Coderoom orders content alphanumerically, just like your operation system does to files and folders. It means, that if
your `source` folder contains files: `Question.html` and `Answer.html`, first will be `Answer.html` and then
`Question.html`.

To change this you can name files and folders, so they contain double-underscore `__`, like `1__Question.html` and
`2__Answer.html`. Coderoom drops prefixes before `__` from titles on a view, but they still can be used to arrange
items in a way you want.

### Resources
Of course, html worth nothing without css and javascript (also images, fonts, etc but it's not a point). To bring life
into your snippets, add `config.json` file to your "room" folder with `media` property. `media` contains an array of
[glob](https://github.com/isaacs/node-glob) patterns, like `['./myProject/css/*', './myProject/js/*']`, that when
resolved are included into presentation.

Also, `config.json` may contain `assets` property with file patterns, that are not included directly, but are copied
along with `media` files. All files are copied to coderoom build with relatedness preservation. It means, that if your
css file contains relative path, like `background-image:url('../images/logo.png');`, and you didn't forget to include
`images` folder into `assets`, it is guaranteed to work.

File patterns are resolved relatively to current working directory.

Each group of snippets may contain own `config.json`. If parent folder has `['./foo.js']` configured as `media`, and
child has `['./bar.js']`, then child "room" will contain both `foo.js` and `bar.js`, while parent will contain only
`foo.js`.

### config.json
| Name   | Type         | Description                                                                                          |
|--------|--------------|------------------------------------------------------------------------------------------------------|
| title  | string       | Set "room's" title. By default folder name is used                                                   |
| media  | array/string | Glob patterns of .css and .js files, that will be included into view                                 |
| assets | array/string | Glob patterns of files that will not be included into view, but will be copied beside to media files |

Example:
```json
{
  "title": "My awesome project",
  "assets": [
    "./vendor/bootstrap-*/**/*"
  ],
  "media": [
    "./vendor/jquery-*.min.js",
    "./vendor/bootstrap-*/css/bootstrap.css*",
    "./vendor/bootstrap-*/js/bootstrap.js",
    "./css/foo.css"
  ]
}
```

### Complex preview
If you want to include to preview more than just html, you have to create a folder with `index.html` in it. If you
place any css or javascript files into that folder, they will become a part of a "room", and you will be able to
switch among them on live presentation.

## Automation
- [grunt-coderoom](https://github.com/goliney/grunt-coderoom)
