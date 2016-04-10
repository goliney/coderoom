(function () {
    'use strict';
    var editor;

    var editorEl = document.getElementById('editor');
    var menuEl = document.getElementById('menu');
    var iframeEl = document.getElementById('iframe');

    markActiveMenu();

    if (editorEl) {
        initACE();
    }

    function initACE() {
        var HtmlMode = ace.require("ace/mode/html").Mode;
        editor = ace.edit(editorEl);
        editor.session.setMode(new HtmlMode());

        editor.setReadOnly(true);
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);

        editorEl.classList.remove('invisible');
    }

    function markActiveMenu() {
        var links = menuEl.getElementsByClassName('link');
        for (var i = 0; i < links.length; i++) {
            var href = (links[i].getAttribute("href")).replace(/\.\.\//g, '');
            if (document.URL.indexOf(href) !== -1) {
                links[i].classList.add('active');
            }
        }
    }
})();