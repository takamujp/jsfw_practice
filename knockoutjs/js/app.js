(function () {
    'use strict';

    var data = {
        memoIds: ko.observableArray([]),
        memos  : ko.observableArray([])
    };

    var ids = localStorage.getItem('Memo');
    if (ids) {
        ids = ids.split(',');
        for (var i = 0, memoIdsLen = ids.length; i < memoIdsLen; i++) {
            data.memoIds.push(ids[i]);
            data.memos.push(ko.mapping.fromJSON(localStorage.getItem('Memo-' + data.memoIds()[i])));
        }
    }

    /**
     * contenteditable対応
     */
    ko.bindingHandlers.editableText = {
        init  : function (element, valueAccessor) {
            $(element).on('blur', function () {
                var observable = valueAccessor();
                observable($(this).html());
            });
        },
        update: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            $(element).html(value);
        }
    };

    /**
     * ヘッダ
     * @constructor
     */
    var HeaderModel = function (data) {
        this.newText = ko.observable("");
        this.data = data;

        /**
         * 追加ボタン押下イベント
         */
        this.onClickAddButton = function () {
            if (this.newText().trim() === '') {
                return;
            }

            var generateId = function () {
                var generateKey = function () {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                return (generateKey() + generateKey() + "-" + generateKey() + "-" + generateKey() + "-" + generateKey() + "-" + generateKey() + generateKey() + generateKey());
            };

            var newMemo = {
                id  : generateId(),
                text: this.newText()
            };
            localStorage.setItem('Memo-' + newMemo.id, JSON.stringify(newMemo));
            this.data.memos.push(newMemo);
            this.data.memoIds.push(newMemo.id);
            localStorage.setItem('Memo', this.data.memoIds().join(','));
            this.newText('');
        };
    };

    var ContentModel = function (data) {
        this.data = data;
        /**
         * 削除ボタン押下イベント
         */
        this.onClickRemoveButton = function (memo) {
            this.data.memos.remove(memo);
            this.data.memoIds.remove(memo.id());
            localStorage.removeItem('Memo-' + memo.id());
            localStorage.setItem('Memo', this.data.memoIds().join(','));
        }.bind(this);
        /**
         * Blurイベント
         */
        this.onBlurMemoBody = function (memo) {
            localStorage.setItem('Memo-' + memo.id(), ko.mapping.toJSON(memo));
        };
    };

    ko.applyBindings(new HeaderModel(data), document.getElementById('header'));
    ko.applyBindings(new ContentModel(data), document.getElementById('content'));

})();
