/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Collection.ObservableListMixin', [
   'js!SBIS3.CONTROLS.Data.Bind.ICollection'
], function (IBindCollection) {
   'use strict';

   /**
    * Миксин, поддерживающий отcлеживание изменений в списках
    * @mixin SBIS3.CONTROLS.Data.Collection.ObservableListMixin
    * @public
    * @author Мальцев Алексей
    */

   var ObservableListMixin = /** @lends SBIS3.CONTROLS.Data.Collection.ObservableListMixin.prototype */{
      $protected: {
         /**
          * @var {Boolean} Генерация событий включена
          */
         _eventsEnabled: true
      },

      $constructor: function () {
         this._publish('onCollectionChange');
         this._onItemSelectedChangeHandler = onItemSelectedChangeHandler.bind(this);
         this._onItemModelChangeHandler = onItemModelChangeHandler.bind(this);
         $ws.helpers.forEach(this._items, this._watchForChanges, this);
      },

      around: {

         //region SBIS3.CONTROLS.Data.Collection.IEnumerable

         concat: function (parentFnc, items, prepend) {
            var newItemsIndex = this.getCount();
            this._eventsEnabled = false;
            parentFnc.call(this, items, prepend);
            this._eventsEnabled = true;
            this._notifyCollectionChange(
               IBindCollection.ACTION_ADD,
               prepend ? this._items.slice(0, this.getCount() - newItemsIndex) : this._items.slice(newItemsIndex),
               prepend ? 0 : newItemsIndex,
               [],
               0
            );
         },

         //endregion SBIS3.CONTROLS.Data.Collection.IEnumerable

         //region SBIS3.CONTROLS.Data.Collection.List

         fill: function (parentFnc, instead) {
            var oldItems = this._items.slice();
            this._eventsEnabled = false;
            parentFnc.call(this, instead);
            this._eventsEnabled = true;
            this._notifyCollectionChange(
               IBindCollection.ACTION_RESET,
               this._items.slice(),
               0,
               oldItems,
               0
            );
         },

         add: function (parentFnc, item, at) {
            parentFnc.call(this, item, at);
            at = this._isValidIndex(at) ? at : this.getCount() - 1;
            this._notifyCollectionChange(
               IBindCollection.ACTION_ADD,
               [this._items[at]],
               at,
               [],
               0
            );
         },

         removeAt: function (parentFnc, index) {
            this._notifyCollectionChange(
               IBindCollection.ACTION_REMOVE,
               [],
               0,
               [this._items[index]],
               index
            );
            parentFnc.call(this, index);
         },

         replace: function (parentFnc, item, at) {
            var oldItem = this._items[at];
            parentFnc.call(this, item, at);
            this._notifyCollectionChange(
               IBindCollection.ACTION_REPLACE,
               [this._items[at]],
               at,
               [oldItem],
               at
            );
         }

         //endregion SBIS3.CONTROLS.Data.Collection.List

         //region SBIS3.CONTROLS.Data.Bind.IBindProperty

         //endregion SBIS3.CONTROLS.Data.Bind.IBindProperty

      },

      //region Protected methods

      /**
       * Генерирует событие об изменении коллеции
       * @param {String} action Действие, приведшее к изменению.
       * @param {SBIS3.CONTROLS.Data.Collection.ICollectionItem[]} newItems Новые элементы коллеции.
       * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
       * @param {SBIS3.CONTROLS.Data.Collection.ICollectionItem[]} oldItems Удаленные элементы коллекции.
       * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
       * @private
       */
      _notifyCollectionChange: function (action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
         if (!this._eventsEnabled) {
            return;
         }

         this._notify(
            'onCollectionChange',
            action,
            newItems,
            newItemsIndex,
            oldItems,
            oldItemsIndex
         );
         this._checkWatchableOnCollectionChange(
            action,
            newItems,
            newItemsIndex,
            oldItems,
            oldItemsIndex
         );
      },

      /**
       * При изменениях коллекции синхронизирует подписки на элементы
       * @param {String} action Действие, приведшее к изменению.
       * @param {SBIS3.CONTROLS.Data.Collection.ICollectionItem[]} newItems Новые элементы коллеции.
       * @param {Number} newItemsIndex Индекс, в котором появились новые элементы.
       * @param {SBIS3.CONTROLS.Data.Collection.ICollectionItem[]} oldItems Удаленные элементы коллекции.
       * @param {Number} oldItemsIndex Индекс, в котором удалены элементы.
       * @private
       */
      _checkWatchableOnCollectionChange: function(action, newItems, newItemsIndex, oldItems) {
         var self = this;
         switch (action){
            case IBindCollection.ACTION_ADD:
               $ws.helpers.forEach(newItems, this._watchForChanges, this);
               break;
            case IBindCollection.ACTION_REMOVE:
               $ws.helpers.forEach(oldItems, this._cancelWatchForChanges, this);
               break;
            case IBindCollection.ACTION_RESET:
            case IBindCollection.ACTION_REPLACE:
               $ws.helpers.forEach(newItems, this._watchForChanges, this);
               $ws.helpers.forEach(oldItems, this._cancelWatchForChanges, this);
               break;
         }
      },

      /**
       * Подписывается на событие onChange на содержимом элемента коллекции
       * @param item {SBIS3.CONTROLS.Data.Collection.ICollectionItem} Элемент коллекции
       * @private
       */
      _watchForChanges: function(item) {
         this.subscribeTo(item, 'onSelectedChange', this._onItemSelectedChangeHandler);

         var contents = item.getContents();
         if (this._needWatchForChanges(contents)) {
            var handlers = contents.getEventHandlers('onChange');
            if (Array.indexOf(handlers, this._onItemModelChangeHandler) === -1) {
               this.subscribeTo(contents, 'onChange', this._onItemModelChangeHandler);
            }
         }
      },

      /**
       * Отписываетсят события onChange
       * @param item {SBIS3.CONTROLS.Data.Collection.ICollectionItem} Элемент коллекции
       * @private
       */
      _cancelWatchForChanges: function(item) {
         this.unsubscribeFrom(item, 'onSelectedChange', this._onItemSelectedChangeHandler);

         var contents = item.getContents();
         if (this._needWatchForChanges(contents)) {
            this.unsubscribeFrom(contents, 'onChange', this._onItemModelChangeHandler);
         }
      },

      /**
       * Проверяет нужно ли следить за изменением содержимого элемента коллекции
       * @param item {*} Содержимое элемента коллекции
       * @returns {Boolean}
       * @private
       */
      _needWatchForChanges: function(item) {
         if ($ws.helpers.instanceOfModule(item, 'SBIS3.CONTROLS.Data.Model')) {
            return true;
         }
         return false;
      }

      //endregion Protected methods
   };

   /**
    * Обработчки события изменения признака выбранности элемента коллекции
    * @param {$ws.proto.EventObject} event Дескриптор события.
    * @param {Boolean} selected Элемент выбран
    * @param {SBIS3.CONTROLS.Data.Collection.ICollectionItem} element Элемент
    */
   var onItemSelectedChangeHandler = function (event, selected, element) {
      var index = this.getIndex(element);
      this._notifyCollectionChange(
         IBindCollection.ACTION_UPDATE,
         [this._items[index]],
         index,
         [this._items[index]],
         index
      );
   },

   /**
    * Обработчк события изменения модели
    * @param {$ws.proto.EventObject} event Дескриптор события.
    * @param {String} name Название свойства
    * @param {*} value Значение свойства
    * @param {SBIS3.CONTROLS.Data.Model} model Инстанс модели
    */
   onItemModelChangeHandler = function (event, name, value, model) {
      var index = this.getIndex(model);
      this._notifyCollectionChange(
         IBindCollection.ACTION_UPDATE,
         [this._items[index]],
         index,
         [this._items[index]],
         index
      );
   };

   return ObservableListMixin;
});
