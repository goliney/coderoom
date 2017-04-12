var editor;

(function () {
    'use strict';

    const $contentEl = $('#content');
    const $editorEl = $('#editor');
    const $iframeEl = $('#iframe');
    const $backdrop = $('#backdrop');

    activateResizable();

    function activateResizable() {
        const minWidth = 200;
        const $handle = $('#resize-handle');

        $handle.bind('mousedown', function (e) {
            let initialX = e.pageX;
            let contentWidth = $contentEl.outerWidth();
            let iframeWidth = $iframeEl.outerWidth();
            let editorWidth = $editorEl.outerWidth();

            $backdrop.removeClass('hidden');
            $backdrop.bind({
                mousemove: function (e) {
                    const delta = initialX - e.pageX;
                    if (editorWidth - delta > minWidth && iframeWidth + delta > minWidth) {
                        const percentage = (iframeWidth + delta) * 100 / contentWidth;
                        $iframeEl.css('width', percentage + '%');
                        editor.resize();
                    }
                },
                mouseup: function () {
                    $backdrop.off('mousemove mouseup');
                    $backdrop.addClass('hidden');
                },
            });
        });
    }
})();