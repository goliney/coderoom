(function () {
    'use strict';

    var editor = ace.edit("editor");
    var JavaScriptMode = ace.require("ace/mode/html").Mode;
    editor.session.setMode(new JavaScriptMode());
})();