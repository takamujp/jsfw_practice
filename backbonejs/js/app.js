(function () {
    'use strict';

    var MemoLocalStorage = new Backbone.LocalStorage('Memo');
    var JST = {
        top : _.template(
            [
                '<div id="top">',
                '   <div id="header">',
                '       <pre id="new-memo" contenteditable="true"></pre><button id="add">+</button>',
                '   </div>',
                '   <div id="content">',
                '   </div>',
                '</div>'
            ].join('\n')
        ),
        memo: _.template(
            [
                '<pre class="memo-body" contenteditable="true"><%= text %></pre>',
                '<div class="memo-menu"><div class="remove-button">x</div></div>',
            ].join('\n')
        )
    };

    /**
     * Router
     *
     * @extends Backbone.Router
     */
    var Router = Backbone.Router.extend({
        routes: {
            '': 'top'
        }
    });

    /**
     * MemoModel
     *
     * @extends Backbone.Model
     */
    var MemoModel = Backbone.Model.extend({
        localStorage: MemoLocalStorage
    });

    /**
     * MemoCollection
     *
     * @extends Backbone.Collection
     */
    var MemoCollection = Backbone.Collection.extend({
        model       : MemoModel,
        localStorage: MemoLocalStorage
    });

    /**
     * TopView
     *
     * @extends Backbone.View
     */
    var TopView = Backbone.View.extend({
        el              : '#top',
        events          : {
            'click #add': 'onClickAddButton',
        },
        /**
         * 初期化
         *
         * @param {object}options options
         */
        initialize      : function (options) {
            this.textArea = this.$el.find('#new-memo');
            this.contentArea = this.$el.find('#content');

            this.collection = new MemoCollection();

            this.listenTo(this.collection, 'add', this.appendMemoView);

            this.collection.fetch();
        },
        /**
         * 描画
         *
         * @return {TopView}
         */
        render          : function () {
            return this;
        },
        /**
         * 追加ボタン押下イベント
         */
        onClickAddButton: function () {
            var text = this.textArea.html().trim();
            var self = this;

            if (!text) {
                return;
            }
            var model = new MemoModel({
                text: text
            });
            model.save(null, {
                success: function () {
                    self.collection.push(model);
                    self.textArea.html('');
                },
                error  : function () {
                    model.save();
                }
            });
        },
        /**
         * MemoViewを追加
         *
         * @param {MemoModel}memoModel
         */
        appendMemoView  : function (memoModel) {
            var view = new MemoView({model: memoModel});
            this.contentArea.append(view.render().$el);
        }
    });

    /**
     * MemoView
     *
     * @extends Backbone.View
     */
    var MemoView = Backbone.View.extend({
        tagName  : 'div',
        className: 'memo',
        events   : {
            'blur .memo-body': 'onBlurMemoBody',
            'click .remove-button': 'onClickRemoveButton'
        },
        /**
         * 初期化
         *
         * @param {object}options options
         */
        initialize: function (options) {
        },
        /**
         * 描画
         *
         * @returns {MemoView}
         */
        render: function () {
            this.$el.html(JST.memo(this.model.toJSON()));
            return this;
        },
        /**
         * メモのblurイベント
         */
        onBlurMemoBody: function () {
            this.memoBody = this.memoBody || this.$el.find('.memo-body');
            this.model.set('text', this.memoBody.html());
            this.model.save();
        },
        /**
         * 削除ボタン押下イベント
         */
        onClickRemoveButton: function () {
            var self = this;
            this.model.destroy({
                success: function () {
                    self.remove();
                }
            });
        }
    });

    /**
     * AppView
     *
     * @extends Backbone.View
     */
    var AppView = Backbone.View.extend({
        el        : '#app',
        /**
         * @type Backbone.View
         */
        mainView  : null,
        /**
         * @type Router
         */
        router    : null,
        /**
         * 初期化
         */
        initialize: function () {
            this.router = new Router();
            this.listenTo(this.router, 'route', this.dispatch);

            Backbone.history.start();
        },
        /**
         * 描画
         *
         * @return {AppView}
         */
        render    : function () {
            return this;
        },
        /**
         * dispatch
         *
         * @param {string}action アクション名
         */
        dispatch  : function (action) {
            if (!_.include(['top'], action)) {
                return;
            }

            if (this.mainView) {
                this.mainView.remove();
            }

            var html = JST[action];

            switch (action) {
                case 'top':
                    this.$el.html(html());
                    this.mainView = new TopView();
                    break;
            }
        }
    });

    var app = new AppView();
})();
