var editor;

(function () {
    'use strict';

    var $menuEl = $('#menu');
    var $contentEl = $('#content');
    var $editorEl = $('#editor');
    var $iframeEl = $('#iframe');
    var $backdrop = $('#backdrop');

    markActiveMenu();
    activateResizable();

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
        $handle.bind('mousedown', function (e) {
            var initialX;
            var contentWidth;
            var iframeWidth;
            var editorWidth;

            $backdrop.removeClass('hidden');
            $backdrop.bind({
                mousemove: function (e) {
                    var delta = initialX - e.pageX;
                    if (editorWidth - delta > minWidth && iframeWidth + delta > minWidth) {
                        var percentage = (iframeWidth + delta) * 100 / contentWidth;
                        $iframeEl.css('width', percentage + '%');
                        editor.resize();
                    }
                },
                mouseup: function () {
                    $backdrop.off('mousemove mouseup');
                    $backdrop.addClass('hidden');
                }
            });

            initialX = e.pageX;
            contentWidth = $contentEl.outerWidth();
            iframeWidth = $iframeEl.outerWidth();
            editorWidth = $editorEl.outerWidth();
        });
    }
})();