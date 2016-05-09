(function () {
    'use strict';
    var editor;

    var $menuEl = $('#menu');
    var $contentEl = $('#content');
    var $editorEl = $('#editor');
    var $iframeEl = $('#iframe');

    markActiveMenu();
    activateResizable();

    if ($editorEl) {
        initACE();
    }

    function initACE() {
        var HtmlMode = ace.require('ace/mode/html').Mode;
        editor = ace.edit($editorEl[0]);
        editor.setReadOnly(true);
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.session.setMode(new HtmlMode());
        editor.session.setUseWrapMode(true);
        editor.session.setWrapLimitRange();

        $editorEl.removeClass('invisible');
    }

    function markActiveMenu() {
        var links = $menuEl.find('.link');
        for (var i = 0; i < links.length; i++) {
            var href = (links[i].getAttribute('href')).replace(/\.\.\//g, '');
            if (document.URL.indexOf(href) !== -1) {
                links[i].classList.add('active');
            }
        }
    }

    function activateResizable() {
        var minWidth = 200;
        var $handle = $('#resize-handle');
        $handle.on('mousedown', function (e) {
            $iframeEl.addClass('resizing');
            var initialX = e.pageX;
            var contentWidth = $contentEl.outerWidth();
            var iframeWidth = $iframeEl.outerWidth();
            var editorWidth = $editorEl.outerWidth();

            $(document).on('mousemove', function (e) {
                var delta = initialX - e.pageX;
                if (editorWidth - delta > minWidth && iframeWidth + delta > minWidth) {
                    var percentage = (iframeWidth + delta) * 100 / contentWidth;
                    $iframeEl.css('width', percentage + '%');
                    editor.resize();
                }
            });

            $(document).on('mouseup', function () {
                $(document).off('mouseup mousemove');
                $iframeEl.removeClass('resizing');
            });
        });
    }
})();