(function () {
    'use strict';

    updateRooms(ROOT);
    function updateRooms(room, depth = 1) {
        room.items.forEach((item, index) => {
            item.index = index;
            updateRooms(item, depth + 1);
        });
    }

    // menu item
    Vue.component('menu-item', {
        delimiters: ['${', '}'],
        props: ['room', 'pathToParent'],
        template: '#menu-item-tpl',
        methods: {
            getRoomUrl() {
                const pathToRoot = Array(DEPTH).join('../');
                return `./${pathToRoot}tpls/${this.pathToRoom}index.html`;
            },
        },
        computed: {
            pathToRoom() {
                return `${this.pathToParent || ''}${this.room.index}/`;
            },
            isActive() {
                // TODO: must be better way of doing this
                const href = this.getRoomUrl().replace(/.+?(?=\/tpls)/, '');
                return document.URL.indexOf(href) !== -1;
            },
        },
    });

    // Sidebar
    new Vue({
        delimiters: ['${', '}'],
        el: '#sidebar',
        data: {
            root: ROOT,
            search: '',
            mounted: false,
            isSearchFocused: false,
        },
        mounted() {
            this.mounted = true;
            this.focusSearch();
        },
        computed: {
            /**
             * Return rooms which title or children title contains search query.
             * Nesting is preserved
             *
             * @returns {Array} - root items which satisfy query
             */
            filteredItems() {
                const query = this.search.toLowerCase().trim();
                const filteredRoot = _traverse({...this.root, title: ''});
                return filteredRoot ? filteredRoot.items : [];

                function _traverse(room) {
                    // return whole room with items if title matches
                    if (room.title.toLowerCase().indexOf(query) > -1) {
                        return room;
                    }
                    // find items that match
                    const items = room.items.reduce((acc, item) => {
                        const traversedItem = _traverse(item);
                        if (traversedItem) {
                            acc.push(traversedItem);
                        }
                        return acc;
                    }, []);
                    // return room with only those items, that match
                    if (items.length > 0) {
                        return {...room, items};
                    }
                }
            },
        },
        methods: {
            clearSearch() {
                this.search = '';
                this.focusSearch();
            },
            focusSearch() {
                this.$refs.search.focus();
            },
        },
    });
})();