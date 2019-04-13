import Control = require('Core/Control');
import template = require('wml!Controls/_explorer/View/View');
import SearchGridViewModel = require('Controls/List/SearchView/SearchGridViewModel');
import TreeGridViewModel = require('Controls/List/TreeGridView/TreeGridViewModel');
import TreeTileViewModel = require('Controls/List/TreeTileView/TreeTileViewModel');
import tmplNotify = require('Controls/Utils/tmplNotify');
import applyHighlighter = require('Controls/Utils/applyHighlighter');
import chain = require('Types/chain');
import cInstance = require('Core/core-instance');
import Env = require('Env/Env');
import keysHandler = require('Controls/Utils/keysHandler');
import 'css!theme?Controls/_explorer/View/View';
import 'Controls/List/TreeTileView/TreeTileView';
import 'Controls/List/TreeGridView/TreeGridView';
import 'Controls/List/SearchView';
import 'Controls/List/TreeControl';
import 'Types/entity';
import 'Controls/treeGrid';
import 'Controls/breadcrumbs';


   var
      HOT_KEYS = {
         backByPath: Env.constants.key.backspace
      };

   var
      ITEM_TYPES = {
         node: true,
         hiddenNode: false,
         leaf: null
      },
      DEFAULT_VIEW_MODE = 'table',
      VIEW_NAMES = {
         search: 'Controls/List/SearchView',
         tile: 'Controls/List/TreeTileView/TreeTileView',
         table: 'Controls/List/TreeGridView/TreeGridView'
      },
      VIEW_MODEL_CONSTRUCTORS = {
         search: SearchGridViewModel,
         tile: TreeTileViewModel,
         table: TreeGridViewModel
      },
      _private = {
         setRoot: function(self, root) {
            if (!self._options.hasOwnProperty('root')) {
               self._root = root;
            }
            self._notify('rootChanged', [root]);
            if (typeof self._options.itemOpenHandler === 'function') {
               self._options.itemOpenHandler(root);
            }
            self._forceUpdate();
         },
         getRoot: function(self) {
            return self._options.hasOwnProperty('root') ? self._options.root : self._root;
         },
         dataLoadCallback: function(self, data) {
            var metaData = data.getMetaData();
            if (metaData.path && metaData.path.getCount() > 0) {
               self._breadCrumbsItems = chain.factory(metaData.path).toArray();
            } else {
               self._breadCrumbsItems = null;
            }
            self._forceUpdate();
            if (self._options.dataLoadCallback) {
               self._options.dataLoadCallback(data);
            }
         },
         itemsReadyCallback: function(self, items) {
            self._items = items;

            if (self._options.itemsReadyCallback) {
               self._options.itemsReadyCallback(items);
            }
         },
         setViewMode: function(self, viewMode) {
            var currentRoot = _private.getRoot(self);
            var dataRoot = _private.getDataRoot(self);

            if (viewMode === 'search' && dataRoot !== currentRoot) {
               _private.setRoot(self, dataRoot);
            }
            self._viewMode = viewMode;
            self._viewName = VIEW_NAMES[viewMode];
            self._viewModelConstructor = VIEW_MODEL_CONSTRUCTORS[viewMode];
         },
         backByPath: function(self) {
            if (self._breadCrumbsItems && self._breadCrumbsItems.length > 0) {
               _private.setRoot(self, self._breadCrumbsItems[self._breadCrumbsItems.length - 1].get(self._options.parentProperty));
            }
         },
         getDataRoot: function(self) {
            var result;

            if (self._breadCrumbsItems && self._breadCrumbsItems.length > 0) {
               result = self._breadCrumbsItems[0].get(self._options.parentProperty);
            } else {
               result = _private.getRoot(self);
            }

            return result;
         },
         dragItemsFromRoot: function(self, dragItems) {
            var
               item,
               itemFromRoot = true,
               root = _private.getDataRoot(self);

            for (var i = 0; i < dragItems.length; i++) {
               item = self._items.getRecordById(dragItems[i]);
               if (!item || item.get(self._options.parentProperty) !== root) {
                  itemFromRoot = false;
                  break;
               }
            }

            return itemFromRoot;
         }
      };

   /**
    * Hierarchical list that can expand and go inside the folders. Can load data from data source.
    * <a href="/materials/demo-ws4-explorer">Demo example</a>.
    * <a href="/materials/demo-ws4-explorer-with-search">Demo example with search</a>.
    *
    * @class Controls/Explorer
    * @extends Core/Control
    * @mixes Controls/interface/ISource
    * @mixes Controls/interface/IItemTemplate
    * @mixes Controls/interface/IPromisedSelectable
    * @mixes Controls/interface/IEditableList
    * @mixes Controls/interface/IGrouped
    * @mixes Controls/interface/INavigation
    * @mixes Controls/interface/IFilter
    * @mixes Controls/interface/IHighlighter
    * @mixes Controls/List/interface/IList
    * @mixes Controls/List/interface/IHierarchy
    * @mixes Controls/List/interface/ITreeControl
    * @mixes Controls/List/interface/IExplorer
    * @mixes Controls/List/interface/IDraggable
    * @mixes Controls/List/interface/ITile
    * @control
    * @public
    * @category List
    * @author Авраменко А.С.
    */

   var Explorer = Control.extend({
      _template: template,
      _breadCrumbsItems: null,
      _root: null,
      _viewName: null,
      _viewMode: null,
      _viewModelConstructor: null,
      _dragOnBreadCrumbs: false,
      _hoveredBreadCrumb: undefined,

      _beforeMount: function(cfg) {
         this._dataLoadCallback = _private.dataLoadCallback.bind(null, this);
         this._itemsReadyCallback = _private.itemsReadyCallback.bind(null, this);
         this._breadCrumbsDragHighlighter = this._dragHighlighter.bind(this);
         _private.setViewMode(this, cfg.viewMode);
      },
      _beforeUpdate: function(cfg) {
         if (this._viewMode !== cfg.viewMode) {
            _private.setViewMode(this, cfg.viewMode);
         }
      },
      _getRoot: function() {
         return _private.getRoot(this);
      },
      _dragHighlighter: function(itemKey, hasArrow) {
         return this._dragOnBreadCrumbs && this._hoveredBreadCrumb === itemKey
            ? 'controls-BreadCrumbsView__dropTarget_' + (hasArrow ? 'withArrow' : 'withoutArrow') : '';
      },
      _documentDragEnd: function(event, dragObject) {
         if (this._hoveredBreadCrumb !== undefined) {
            this._notify('dragEnd', [dragObject.entity, this._hoveredBreadCrumb, 'on']);
         }
         this._dragOnBreadCrumbs = false;
      },
      _documentDragStart: function(event, dragObject) {
         //TODO: Sometimes at the end of dnd, the parameter is not reset. Will be fixed by: https://online.sbis.ru/opendoc.html?guid=85cea965-2aa6-4f1b-b2a3-1f0d65477687
         this._hoveredBreadCrumb = undefined;

         if (this._options.itemsDragNDrop && cInstance.instanceOfModule(dragObject.entity, 'Controls/_dragnDrop/Entity/Items')) {

            //No need to show breadcrumbs when dragging items from the root, being in the root of the registry.
            this._dragOnBreadCrumbs = _private.getRoot(this) !== _private.getDataRoot(this) || !_private.dragItemsFromRoot(this, dragObject.entity.getItems());
         }
      },
      _hoveredCrumbChanged: function(event, item) {
         this._hoveredBreadCrumb = item ? item.getId() : undefined;
      },
      _onItemClick: function(event, item, clickEvent) {
         if (item.get(this._options.nodeProperty) === ITEM_TYPES.node) {
            _private.setRoot(this, item.getId());
         }
         event.stopPropagation();
         this._notify('itemClick', [item, clickEvent]);
      },
      _onBreadCrumbsClick: function(event, item) {
         _private.setRoot(this, item.getId());
      },
      _onExplorerKeyDown: function(event) {
         keysHandler(event, HOT_KEYS, _private, this);
      },
      beginEdit: function(options) {
         return this._children.treeControl.beginEdit(options);
      },
      beginAdd: function(options) {
         return this._children.treeControl.beginAdd(options);
      },
      cancelEdit: function() {
         return this._children.treeControl.cancelEdit();
      },
      commitEdit: function() {
         return this._children.treeControl.commitEdit();
      },
      reload: function() {
         return this._children.treeControl.reload();
      },
      _notifyHandler: tmplNotify,
      _applyHighlighter: applyHighlighter
   });

   Explorer._private = _private;
   Explorer._constants = {
      DEFAULT_VIEW_MODE: DEFAULT_VIEW_MODE,
      ITEM_TYPES: ITEM_TYPES,
      VIEW_NAMES: VIEW_NAMES,
      VIEW_MODEL_CONSTRUCTORS: VIEW_MODEL_CONSTRUCTORS
   };

   Explorer.getDefaultOptions = function() {
      return {
         multiSelectVisibility: 'hidden',
         viewMode: DEFAULT_VIEW_MODE,
         backButtonStyle: 'secondary',
         stickyHeader: true
      };
   };

   export = Explorer;

