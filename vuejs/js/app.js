(function () {
    'use strict';

    /**
     * contenteditableな要素とmodelを双方向bindさせるディレクティブ
     */
    Vue.directive('bind-editable-text', {
        twoWay: true,
        bind: function () {
            this.vm.$watch('newText', function (value) {
                this.el.innerHTML = value;
            }.bind(this));

            this.handler = function () {
                this.set(this.el.innerHTML);
            }.bind(this);

            this.el.addEventListener('blur', this.handler);
        },
        unbind: function () {
            this.vm.$unwatch('newText');
            this.el.removeEventListener('blur', this.handler);
        }
    });

    /**
     * contenteditableな要素を保存するディレクティブ
     */
    Vue.directive('save-editable-text', {
        bind: function () {
            this.handler = function () {
                this.vm.memo.text = this.el.innerHTML;
                localStorage.setItem('Memo-' + this.vm.memo.id, JSON.stringify(this.vm.memo));
            }.bind(this);

            this.el.addEventListener('blur', this.handler);
        },
        unbind: function () {
            this.el.removeEventListener('blur', this.handler);
        }
    });

    var app = new Vue({
        el: '#app',
        data : {
            memoIds: [],
            memos: [],
            newText: ''
        },
        /**
         * 初期化
         */
        created: function () {
            var ids = localStorage.getItem('Memo');
            if (ids) {
                this.memoIds = ids.split(',');
            }

            for (var i = 0,len = this.memoIds.length; i < len; i++) {
                this.memos.push(JSON.parse(localStorage.getItem('Memo-' + this.memoIds[i])));
            }

            this.$watch('memoIds', function () {
                localStorage.setItem('Memo', this.memoIds.join(','));
            });
        },
        methods: {
            /**
             * 追加ボタン押下イベント
             */
            onClickAddButton: function () {
                if (!this.newText.trim()) {
                    return;
                }

                var generateId = function () {
                    var generateKey = function () {
                        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                    };
                    return (generateKey() + generateKey() + "-" + generateKey() + "-" + generateKey() + "-" + generateKey() + "-" + generateKey() + generateKey() + generateKey());
                };

                var newMemo = {
                    id: generateId(),
                    text: this.newText
                };
                localStorage.setItem('Memo-' + newMemo.id, JSON.stringify(newMemo));
                this.memos.push(newMemo);
                this.memoIds.push(newMemo.id);
                this.newText = '';
            },
            /**
             * 削除ボタン押下イベント
             *
             * @param {number}$index
             */
            onClickRemoveButton: function ($index) {
                var memo = this.memos.$remove($index);
                this.memoIds.$remove(this.memoIds.indexOf(memo.id));
            }
        }
    });
})();
