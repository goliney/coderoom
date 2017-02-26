(function () {
    'use strict';
    var FILTERED_OUT_CLASS = 'filtered-out';
    var FILTERED_IN_CLASS = 'filtered-in';
    var DIR_FILTERED_IN_CLASS = 'dir-filtered-in';
    var HAS_QUERY_CLASS = 'has-query';
    var NO_ITEMS_AVAILABLE_CLASS = 'no-search-results';
    var SEARCH_DATA_KEY = 'SEARCH_DATA_KEY';

    var $sidebar = $('#sidebar');
    var $searchWrap = $sidebar.find('.search');
    var $input = $searchWrap.find('input');
    var $clear = $searchWrap.find('[clear]');

    var $items = $sidebar.find('li:not(.search)');

    activate();

    function activate() {
        $input.focus();
        bindEvents();
        prepareTreeData();
    }

    function bindEvents() {
        $input.on('focus', function () {
            $searchWrap.addClass('focus');
        });

        $input.on('blur', function () {
            $searchWrap.removeClass('focus');
        });

        $input.on('keydown', function (e) {
            if (e.keyCode == 27) {  // ESC
                $input.val('');
                $input.change();
            }
        });

        $input.on('propertychange change click keyup input paste', function () {
            var value = $input.val().trim();
            if ($input.data('oldVal') != value) {
                $input.data('oldVal', value);

                if (value.length > 0) {
                    $searchWrap.addClass(HAS_QUERY_CLASS);
                    filter(value);
                } else {
                    $searchWrap.removeClass(HAS_QUERY_CLASS);
                    clearFilter();
                }
                checkItemsAvailability();
            }
        });

        $clear.on('click', function () {
            $input.val('');
            $input.change();
            $input.focus();
        });
    }

    function prepareTreeData() {
        $items.each(function () {
            var $item = $(this);
            var $childDir = $item.children('.dir-name');
            var $children = $item.find('.link, .dir-name');
            var $arrayOfNames = $children.map(function () {
                return $(this).text().toLowerCase();
            });
            var isDir = $childDir.length > 0;

            $item.data(SEARCH_DATA_KEY, {
                isDir: isDir,
                dirName: isDir ? $childDir.text().toLowerCase() : '',
                allNames: $arrayOfNames.get(),
            });
        });
    }

    function filter(query) {
        query = query.toLowerCase();
        $items.each(function () {
            var $item = $(this);
            var childrenNames = $item.data(SEARCH_DATA_KEY).allNames;
            var isDir = $item.data(SEARCH_DATA_KEY).isDir;
            var dirName = $item.data(SEARCH_DATA_KEY).dirName;

            var hasMatchedChild = childrenNames.some(function (name) {
                return name.indexOf(query) !== -1;
            });

            var isDirMatch = isDir && dirName.indexOf(query) !== -1;
            var hasParentDirMatch = $item.parents('.' + DIR_FILTERED_IN_CLASS).length > 0;

            // if dir name matches search - set class to dir
            if (isDirMatch) {
                $item.addClass(DIR_FILTERED_IN_CLASS);
            } else {
                $item.removeClass(DIR_FILTERED_IN_CLASS);
            }

            if (hasMatchedChild || hasParentDirMatch) {
                $item.addClass(FILTERED_IN_CLASS);
                $item.removeClass(FILTERED_OUT_CLASS);
            } else {
                $item.addClass(FILTERED_OUT_CLASS);
                $item.removeClass(FILTERED_IN_CLASS);
            }
        });
    }

    function clearFilter() {
        $items.removeClass(FILTERED_IN_CLASS);
        $items.removeClass(FILTERED_OUT_CLASS);
    }

    function checkItemsAvailability() {
        var hasAvailableItems = $items.filter('.' + FILTERED_IN_CLASS).length > 0;
        var hasQuery = $input.val().length > 0;
        if (hasAvailableItems || !hasQuery) {
            $sidebar.removeClass(NO_ITEMS_AVAILABLE_CLASS);
        } else {
            $sidebar.addClass(NO_ITEMS_AVAILABLE_CLASS);
        }
    }
})();