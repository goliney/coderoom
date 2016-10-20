/* global editor:true */
(function () {
    'use strict';

    var $editorEl = $('#editor');
    var modes = {
        html: null,
        css: null,
        js: null
    };

    if ($editorEl) {
        initACE();
    }

    function initACE() {
        var HtmlMode = ace.require('ace/mode/html').Mode;
        var CssMode = ace.require('ace/mode/css').Mode;
        var JsMode = ace.require('ace/mode/javascript').Mode;
        modes.html = new HtmlMode();
        modes.css = new CssMode();
        modes.js = new JsMode();

        editor = ace.edit($editorEl[0]);
        editor.setReadOnly(true);
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.session.setUseWrapMode(true);
        editor.session.setWrapLimitRange();
        editor.$blockScrolling = Infinity;

        var initialPath = $('.show-snippet a.active').data('path');
        show(initialPath);
        $editorEl.removeClass('invisible');
    }

    $('.show-snippet a').bind('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        show($(this).data('path'));
        $('.show-snippet a').removeClass('active');
        $(this).addClass('active');
    });

    function show(path) {
        var $snippetEl = $('.snippet[data-path="' + path +'"]');
        var mode = $snippetEl.data('mode');
        var content = $snippetEl.text();
        editor.setValue(content, -1);
        editor.session.setMode(modes[mode]);
    }
})();