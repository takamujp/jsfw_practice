(function () {
    'use strict';

    var generateId = function () {
        var generateKey = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (generateKey() + generateKey() + "-" + generateKey() + "-" + generateKey() + "-" + generateKey() + "-" + generateKey() + generateKey() + generateKey());
    };

    var app = angular.module('memo', ['ngStorage', 'contenteditable']);
    app.filter('unsafe', function ($sce) {
        return $sce.trustAsHtml;
    });

    /**
     * MemoController
     */
    app.controller('memoController', function ($scope, $localStorage) {
        $scope.newText = '';
        $scope.$storage = $localStorage.$default({Memo: ''});
        $scope.memoKeys = $scope.$storage.Memo.split(',');

        /**
         * 追加ボタン押下イベント
         */
        $scope.onClickAddButton = function () {
            if (!$scope.newText) {
                return;
            }

            var newMemo = {
                id  : generateId(),
                text: $scope.newText
            };

            var keys = $scope.$storage.Memo ? $scope.$storage.Memo.split(',') : [];
            keys.push(newMemo.id);
            $scope.$storage.Memo = keys.join(',');
            $scope.$storage[newMemo.id] = newMemo;

            $scope.newText = '';
        };
        /**
         * メモのblurイベント
         *
         * @param {string}id メモid
         * @param {Event}$event イベント
         */
        $scope.onBlurMemoBody = function (id, $event) {
            $scope.$storage[id].text = $event.target.innerHTML;
        };

        /**
         * 削除ボタン押下イベント
         * * @param {number}$index
         */
        $scope.onClickRemoveButton = function ($index) {
            var keys = $scope.$storage.Memo ? $scope.$storage.Memo.split(',') : [];
            keys.splice($index, 1);
            $scope.$storage.Memo = keys.join(',');
        };
    });
})();