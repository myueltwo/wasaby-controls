define('Controls-demo/List/Tree/ExpandedItemsBinding', [
   'Core/Control',
   'Controls-demo/List/Tree/GridData',
   'wml!Controls-demo/List/Tree/ExpandedItemsBinding',
   'Types/source',
   'Controls-demo/Utils/MemorySourceFilter',
   'css!Controls-demo/List/Tree/Tree',
   'Controls/scroll',
   'Controls/treeGrid',
   'wml!Controls-demo/List/Tree/DemoContentTemplate'
], function(BaseControl, GridData, template, Source, memorySourceFilter) {
   'use strict';
   var ModuleClass = BaseControl.extend({
      _template: template,
      _groupingKeyCallback: null,
      _viewSource: null,
      gridData: null,
      gridColumns: null,
      _myExpandedItems: null,
      _beforeMount: function() {
         this._myExpandedItems=[2246];
         this.gridColumns = [
            {
               displayProperty: 'Наименование',
               width: '1fr',
               template: 'wml!Controls-demo/List/Tree/DemoContentTemplate'
            }
         ];
         this.gridData = GridData;
         this._viewSource = new Source.Memory({
            idProperty: 'id',
            data: GridData.catalog,

            filter: memorySourceFilter()
         });
      }

   });

   return ModuleClass;
});
