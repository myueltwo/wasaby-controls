define('Controls/BreadCrumbs/View', [
   'Core/Control',
   'Types/collection',
   'Controls/Utils/applyHighlighter',
   'wml!Controls/BreadCrumbs/View/View',
   'wml!Controls/BreadCrumbs/View/resources/itemTemplate',
   'wml!Controls/BreadCrumbs/View/resources/itemsTemplate',
   'wml!Controls/BreadCrumbs/resources/menuItemTemplate',
   'wml!Controls/BreadCrumbs/resources/menuContentTemplate',
   'css!theme?Controls/BreadCrumbs/View/View'
], function(
   Control,
   collection,
   applyHighlighter,
   template,
   itemTemplate,
   itemsTemplate,
   menuItemTemplate
) {
   'use strict';

   /**
    * BreadCrumbs/View.
    *
    * @class Controls/BreadCrumbs/View
    * @extends Core/Control
    * @mixes Controls/interface/IBreadCrumbs
    * @control
    * @private
    * @author Зайцев А.С.
    */

   var BreadCrumbsView = Control.extend({
      _template: template,
      _itemsTemplate: itemsTemplate,

      _beforeMount: function() {
         // Эта функция передаётся по ссылке в Opener, так что нужно биндить this, чтобы не потерять его
         this._onResult = this._onResult.bind(this);
      },

      _onItemClick: function(e, itemData) {
         if (itemData.isDots) {
            var rs = new collection.RecordSet({
               rawData: this._options.items.map(function(item) {
                  var newItem = {};
                  item.each(function(field) {
                     newItem[field] = item.get(field);
                  });
                  return newItem;
               }),
               idProperty: this._options.items[0].getIdProperty()
            });
            rs.each(function(item, index) {
               item.set('indentation', index);
            });
            this._children.menuOpener.open({
               target: e.target,
               templateOptions: {
                  items: rs,
                  itemTemplate: menuItemTemplate
               }
            });
            e.stopPropagation();
         } else {
            this._notify('itemClick', [itemData.item]);
         }
      },

      _applyHighlighter: applyHighlighter,

      _onHoveredItemChanged: function(event, item) {
         this._notify('hoveredItemChanged', [item]);
      },

      _onResize: function() {
         this._children.menuOpener.close();
      },

      _onResult: function(args) {
         var actionName = args && args.action;

         if (actionName === 'itemClick') {
            this._notify('itemClick', [args.data[0]]);
         }
         this._children.menuOpener.close();
      }
   });
   
   BreadCrumbsView.getDefaultOptions = function getDefaultOptions() {
      return {
         itemTemplate: itemTemplate
      };
   };

   return BreadCrumbsView;
});
