/**
 * Created by kraynovdo on 16.11.2017.
 */
define('Controls/List/ListViewModel',
   ['Core/Abstract', 'Controls/List/ItemsViewModel', 'Controls/Controllers/Multiselect/Selection', 'WS.Data/Entity/VersionableMixin'],
   function(Abstract, ItemsViewModel, MultiSelection, VersionableMixin) {
      /**
       *
       * @author Крайнов Дмитрий
       * @public
       */

      var _private = {
         updateIndexes: function(self) {
            self._startIndex = 0;
            self._stopIndex = self.getCount();
         }
      };
      
      var ListViewModel = ItemsViewModel.extend([VersionableMixin], {
         _markedItem: null,
         _draggingItem: null,
         _actions: null,

         constructor: function(cfg) {
            var self = this;
            this._actions = [];
            ListViewModel.superclass.constructor.apply(this, arguments);

            if (cfg.markedKey !== undefined) {
               this._markedItem = this.getItemById(cfg.markedKey, cfg.keyProperty);
            }

            this._multiselection = new MultiSelection({
               selectedKeys: cfg.selectedKeys,
               excludedKeys: cfg.excludedKeys
            });

            //TODO надо ли?
            _private.updateIndexes(self);
         },

         getCurrent: function() {
            var itemsModelCurrent = ListViewModel.superclass.getCurrent.apply(this, arguments);
            itemsModelCurrent.isSelected = itemsModelCurrent.dispItem === this._markedItem;
            itemsModelCurrent.itemActions =  this._actions[this.getCurrentIndex()];
            itemsModelCurrent.isActive = this._activeItem && itemsModelCurrent.dispItem.getContents() === this._activeItem.item;
            itemsModelCurrent.showActions = !this._editingItemData && (!this._activeItem || (!this._activeItem.contextEvent && itemsModelCurrent.isActive));
            itemsModelCurrent.isSwiped = this._swipeItem && itemsModelCurrent.dispItem.getContents() === this._swipeItem.item;
            itemsModelCurrent.multiSelectStatus = this._multiselection.getSelectionStatus(itemsModelCurrent.key);
            itemsModelCurrent.multiSelectVisibility = this._options.multiSelectVisibility === 'visible';
            if (this._editingItemData && itemsModelCurrent.index === this._editingItemData.index) {
               itemsModelCurrent.isEditing = true;
               itemsModelCurrent.item = this._editingItemData.item;
            }
            if (this._draggingItem && this._draggingItem.get(this._options.keyProperty) === itemsModelCurrent.item.get(this._options.keyProperty)) {
               itemsModelCurrent.isDragging = true;
            }
            return itemsModelCurrent;
         },

         setMarkedKey: function(key) {
            this._markedItem = this.getItemById(key, this._options.keyProperty);
            this._nextVersion();
            this._notify('onListChange');
         },

         setActiveItem: function(itemData) {
            this._activeItem = itemData;
            this._nextVersion();
         },

         setDraggingItem: function(item) {
            this._draggingItem = item;
            this._nextVersion();
            this._notify('onListChange');
         },

         setSwipeItem: function(itemData) {
            this._swipeItem = itemData;
            this._nextVersion();
         },

         select: function(keys) {
            this._multiselection.select(keys);
            this._nextVersion();
            this._notify('onListChange');
         },

         unselect: function(keys) {
            this._multiselection.unselect(keys);
            this._nextVersion();
            this._notify('onListChange');
         },

         updateIndexes: function(startIndex, stopIndex) {
            if ((this._startIndex !== startIndex) || (this._stopIndex !== stopIndex)) {
               this._startIndex = startIndex;
               this._stopIndex = stopIndex;
               this._nextVersion();
               this._notify('onListChange');
            }
         },

         setItems: function(items) {
            ListViewModel.superclass.setItems.apply(this, arguments);
            if (this._options.markedKey !== undefined) {
               this._markedItem = this.getItemById(this._options.markedKey, this._options.keyProperty);
            }
            this._nextVersion();
            _private.updateIndexes(this);
         },

         _setEditingItemData: function(itemData) {
            this._editingItemData = itemData;
            if (itemData && itemData.item) {
               this.setMarkedKey(itemData.item.get(this._options.keyProperty));
            }
         },
         setItemActions: function(item, actions) {
            this._actions[this.getIndexBySourceItem(item)] = actions;
         },

         __calcSelectedItem: function(display, selKey, keyProperty) {

            //TODO надо вычислить индекс
            /*if(!this._markedItem) {
             if (!this._selectedIndex) {
             this._selectedIndex = 0;//переводим на первый элемент
             }
             else {
             this._selectedIndex++;//условно ищем ближайший элемент, рядом с удаленным
             }
             this._markedItem = this._display.at(this._selectedIndex);
             }*/
         }
      });

      return ListViewModel;
   });
