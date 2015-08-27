define('js!SBIS3.CONTROLS.HierarchyDataGridView', [
   'js!SBIS3.CONTROLS.DataGridView',
   'js!SBIS3.CONTROLS.hierarchyMixin',
   'html!SBIS3.CONTROLS.HierarchyDataGridView/resources/rowTpl',
   'js!SBIS3.CONTROLS.BreadCrumbs',
   'is!browser?html!SBIS3.CONTROLS.DataGridView/resources/DataGridViewGroupBy'
], function (DataGridView, hierarchyMixin, rowTpl, BreadCrumbs, groupByTpl) {
   'use strict';
   /**
    * Контрол отображающий набор данных, имеющих иерархическую структуру, в виде в таблицы с несколькими колонками.
    * @class SBIS3.CONTROLS.HierarchyDataGridView
    * @extends SBIS3.CONTROLS.DataGridView
    * @mixes SBIS3.CONTROLS.hierarchyMixin
    * @author Крайнов Дмитрий Олегович
    * @control
    * @public
    * @initial
    * <component data-component='SBIS3.CONTROLS.HierarchyDataGridView'>
    *    <options name="columns" type="array">
    *       <options>
    *          <option name="title">Поле 1</option>
    *          <option name="width">100</option>
    *       </options>
    *       <options>
    *          <option name="title">Поле 2</option>
    *       </options>
    *    </options>
    * </component>
    */

   var HierarchyDataGridView = DataGridView.extend([hierarchyMixin], /** @lends SBIS3.CONTROLS.HierarchyDataGridView.prototype*/ {
      /**
       * @event onSearchPathClick При клике по хлебным крошкам в режиме поиска.
       * Событие, происходящее после клика по хлебным крошкам, отображающим результаты поиска
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       * @param {number} id ключ узла, по которму кликнули
       * @return Если вернуть false - загрузка узла не произойдет
       * @example
       * <pre>
       *    DataGridView.subscribe('onSearchPathClick', function(event){
       *      searchForm.clearSearch();
       *    });
       * </pre>
       */
      $protected: {
         _rowTpl: rowTpl,
         _breadCrumbs : [],
         _lastParent : undefined,
         _lastDrawn : undefined,
         _lastPath : []
      },

      $constructor: function () {
        this._publish('onSetRoot', 'onSearchPathClick');
         //чтобы не добавлять новый шаблон модуля просто добавим класс тут
         this.getContainer().addClass('controls-HierarchyDataGridView');
      },

      _dataLoadedCallback: function () {
         HierarchyDataGridView.superclass._dataLoadedCallback.call(this, arguments);
      },

      _elemClickHandlerInternal: function (data, id, target) {
         if (data.get(this._options.hierField+'@')) {
            var nodeID = $(target).closest('.controls-ListView__item').data('id');
            this.setCurrentRoot(nodeID);
         }
      },
      reload: function(){
         this._lastParent = undefined;
         this._lastDrawn = undefined;
         this._lastPath = [];
         return HierarchyDataGridView.superclass.reload.apply(this, arguments);
      },
      _clearItems : function(){
         this._lastParent = this._curRoot;
         this._lastDrawn = undefined;
         this._lastPath = [];
         this._destroySearchBreadCrumbs();
         HierarchyDataGridView.superclass._clearItems.apply(this, arguments);
      },

      getSearchGroupBy: function(field){
         return {
            field: field,
            template : groupByTpl,
            method : this._searchMethod.bind(this),
            render : this._searchRender.bind(this)
         }
      },
      //----------------- defaultSearch group
      /**
       * Метод поиска по умолчанию
       * @param record
       * @param at
       * @returns {{drawItem: boolean, drawGroup: boolean}}
       */
      _searchMethod: function(record, at, last){
         //TODO lastParent - curRoot - правильно?. 2. Данные всегда приходят в правильном порядке?
         var key,
               curRecRoot,
               drawItem = false,
               kInd = -1;
         if (this._lastParent === undefined) {
            this._lastParent = this._curRoot;
         }
         key = record.getKey();
         curRecRoot = record.get(this._options.hierField);
         if (curRecRoot[0] === this._lastParent){
            //Лист
            if (record.get(this._options.hierField + '@') !== true){
               //Нарисуем путь до листа, если пришли из папки
               if (this._lastDrawn !== 'leaf' && this._lastPath.length) {
                  this._drawGroup(record, at);
               }
               this._lastDrawn = 'leaf';
               drawItem = true;
               //this._drawItem(record);//delete
            } else { //папка
               this._lastDrawn = undefined;
               this._lastPath.push(record);
               this._lastParent = key;
               //Если мы уже в последней записи в иерархии, то нужно отрисовать крошки и сбросить сохраненный путь
               if (last) {
                  this._drawGroup(record, at);
                  this._lastPath = [];
                  this._lastParent = this._curRoot;
               }
            }
         } else {//другой кусок иерархии
            //Если текущий раздел у записи есть в lastPath, то возьмем все элементы до этого ключа
            kInd = -1;
            for (var k = 0; k < this._lastPath.length; k++) {
               if (this._lastPath[k].getKey() === curRecRoot[0]){
                  kInd = k;
                  break;
               }
            }
            //Если текущий раздел есть в this._lastPath его надо нарисовать
            if (  this._lastDrawn !== 'leaf' && this._lastPath.length) {
               this._drawGroup(record, at);
            }
            this._lastDrawn = undefined;
            this._lastPath = kInd >= 0 ? this._lastPath.slice(0, kInd + 1) : [];
            //Лист
            if (record.get(this._options.hierField + '@') !== true){
               if ( this._lastPath.length) {
                  this._drawGroup(record, at);
               }
               drawItem = true;
               //this._drawItem(record);//delete
               this._lastDrawn = 'leaf';
               this._lastParent = curRecRoot[0];
            } else {//папка
               this._lastDrawn = undefined;
               this._lastPath.push(record);
               this._lastParent = key;
               //Если мы уже в последней записи в иерархии, то нужно отрисовать крошки и сбросить сохраненный путь
               if (last) {
                  this._drawGroup(record, at);
                  this._lastPath = [];
                  this._lastParent = this._curRoot;
               }
            }
         }
         return {
            drawItem : drawItem,
            drawGroup: false
         };
      },
      _searchRender: function(item, container){
         this._drawBreadCrumbs(this._lastPath, item, container);
         return container;
      },
      _drawBreadCrumbs:function(path, record, container){
         if (path.length) {
            var self = this,
                  elem;
            container.find('td').append(elem = $('<div/>'));

            var ps = new BreadCrumbs({
               element : elem,
               items: this._createPathItemsDS(path),
               highlightEnabled: this._options.highlightEnabled,
               highlightText: this._options.highlightText,
               colorMarkEnabled: this._options.colorMarkEnabled,
               colorField: this._options.colorField,
               className : 'controls-BreadCrumbs__smallItems'
            });
            ps.once('onItemClick', function(event, id){
               //Таблицу нужно связывать только с тем PS, в который кликнули. Хорошо, что сначала идет _notify('onBreadCrumbClick'), а вотом выполняется setCurrentRoot
               event.setResult(false);
               if (self._notify('onSearchPathClick', id) !== false ) {
                  //TODO в будущем нужно отдать уже dataSet крошек, ведь здесь уже все построено
                  /*TODO для Алены. Временный фикс, потому что так удалось починить*/
                  var filter = $ws.core.merge(self._filter, {
                     'Разворот' : 'Без разворота',
                     'СтрокаПоиска': undefined
                  });
                  self.setInfiniteScroll(false, true);
                  self.setGroupBy({});
                  self.setHighlightText('', false);
                  self._filter = filter;
                  self.setCurrentRoot(id);
               }
            });
            this._breadCrumbs.push(ps);
         } else{
            //если пути нет, то группировку надо бы убить...
            container.remove();
         }

      },
      _isViewElement: function(elem) {
         return HierarchyDataGridView.superclass._isViewElement.apply(this, arguments)
                && !elem.hasClass('controls-HierarchyDataGridView__path')
                && !(elem.wsControl() instanceof BreadCrumbs);
      },
      _createPathItemsDS: function(pathRecords){
         var dsItems = [];
         for (var i = 0; i < pathRecords.length; i++){
            dsItems.push({
               id: pathRecords[i].getKey(),
               title: pathRecords[i].get(this._options.displayField),
               parentId: pathRecords[i].get(this._options.hierField)[0]
            });
         }
         return dsItems;
      },
      _destroySearchBreadCrumbs: function(){
         for (var i =0; i < this._breadCrumbs.length; i++){
            this._breadCrumbs[i].destroy();
         }
         this._breadCrumbs = [];
      }
   });

   return HierarchyDataGridView;
});