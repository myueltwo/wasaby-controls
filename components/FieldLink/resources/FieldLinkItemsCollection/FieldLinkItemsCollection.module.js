/**
 * Created by am.gerasimov on 06.10.2015.
 */
define('js!SBIS3.CONTROLS.FieldLinkItemsCollection', [
      'js!SBIS3.CORE.CompoundControl',
      'js!SBIS3.CONTROLS.ItemsControlMixin',
      'js!SBIS3.CONTROLS.PickerMixin',
      'html!SBIS3.CONTROLS.FieldLinkItemsCollection',
      'html!SBIS3.CONTROLS.FieldLinkItemsCollection/defaultItemTemplate',
      'html!SBIS3.CONTROLS.FieldLinkItemsCollection/defaultItemContentTemplate',
      'Core/helpers/collection-helpers',
      'Core/core-instance',
      'Core/helpers/functional-helpers'
   ], function(CompoundControl, DSMixin, PickerMixin, dotTplFn, defaultItemTemplate, defaultItemContentTemplate, colHelpers, cInstance, fHelpers) {

      'use strict';

      /**
       * Контрол, отображающий набор элементов поля связи.
       * @class SBIS3.CONTROLS.FieldLinkItemsCollection
       * @extends SBIS3.CORE.CompoundControl
       */

      function itemTemplateRender(opts) {
         var items = [],
             tplArgs ={},
             res = [];

         if(opts._preRenderValues.selectedItem && cInstance.instanceOfModule(opts._preRenderValues.selectedItem, 'WS.Data/Entity/Model')) {
            items = [opts._preRenderValues.selectedItem];
         } else if (opts._preRenderValues.selectedItems) {
            items = opts._preRenderValues.selectedItems.toArray();
         }

         if(items.length) {
            tplArgs = opts._buildTplArgs(opts);
            tplArgs.className = 'controls-ListView__item';
            tplArgs.itemTemplate = opts.itemTemplate;
            colHelpers.forEach(items, function(item) {
               tplArgs.item = item;
               res.push(tplArgs.defaultItemTpl(tplArgs));
            })
         }

         return res.join('');
      }

      var FieldLinkItemsCollection =  CompoundControl.extend([DSMixin, PickerMixin], {
         _dotTplFn: dotTplFn,
         $protected: {
            _options: {
               _defaultItemContentTemplate: defaultItemContentTemplate,
               _defaultItemTemplate: defaultItemTemplate,
               _preRenderFunction: itemTemplateRender,
               _preRenderValues: {}
            },
            _parentFieldLink: undefined
         },

         $constructor: function() {
            this._publish('onCrossClick', 'onItemActivate', 'onShowPicker', 'onClosePicker');

            /* Запомним контейнер поля связи */
            this._parentFieldLink = this.getParent();
         },

         _eventHandler: function(event, arg) {
            var fieldLink = this._parentFieldLink;
            switch (event.name) {
               case 'onDrawItems':
                  fieldLink._onDrawItemsCollection.call(fieldLink);
                  break;
               case 'onCrossClick':
                  fieldLink._onCrossClickItemsCollection.call(fieldLink, arg);
                  break;
               case 'onItemActivate':
                  fieldLink._onItemActivateItemsCollection.call(fieldLink, arg);
                  break;
            }
         },

         _onClickHandler: function(e) {
            var $target = $(e.target),
                deleteAction = false,
                self = this,
                itemContainer;

            function focusFL() {
               self._parentFieldLink.setActive(true);
            }

            itemContainer = $target.closest('.controls-FieldLink__item', this._container[0]);
            if(itemContainer.length) {
               deleteAction = $target.hasClass('controls-FieldLink__item-cross');
               this._notify(deleteAction ? 'onCrossClick' : 'onItemActivate', itemContainer.data('id'));
            }

            /* При клике по элементам коллекции поля связи, надо, чтобы курсор отображался в поле ввода,
               поэтому при клике вызываем setActive для поля связи, который переведёт курсор в поле ввода,
               однако, если кликнули по крестику и в событии удаления фокус перевели,
               то делать активным поле связи не надо */
            if(deleteAction) {
               if(this._parentFieldLink.isActive()) {
                  focusFL();
               }
            } else {
               focusFL();
            }
         },

         /**
          * Аргументы для шаблона
          */
         _buildTplArgs: function(item) {
            var args = FieldLinkItemsCollection.superclass._buildTplArgs.apply(this, arguments),
                projection = this._getItemsProjection();

            args.itemTemplate = this._options.itemTemplate;
            args.projection = projection;
            args.itemsCount = projection.getCount();
            /* При отображении выбранных элементов в выпадающем списке надо их сортировать,
               чтобы визуально казалось, что последние выбранные будут вверху,
               делается это с помощью аттрибута order (на css), чтобы ускорить отрисовку,
               order навешивается в шаблоне. Для отображения в самом поле связи это не требуется,
               поэтому добавляю проверку на видимость выпадающего списка */
            args.needSort = this.isPickerVisible();
            return args;
         },

         /**
          * Для обратной совместимости, если шаблон задают как itemTemplate,
          * то в качестве базового шаблона всё равно должен использоваться defaultItemTemplate
          */
         _getItemTemplate: function() {
            return this._options._defaultItemTemplate;
         },

         _setEnabled: function () {
            /* Т.к. при изменении состояния поля связи, для всех элементов появляются/исчезают крестики удаления,
               то надо вызывать перерисовку элементов, чтобы правильно проставилась ширина */
            this._clearItems();
            FieldLinkItemsCollection.superclass._setEnabled.apply(this, arguments);
            this.redraw();
         },

         _getItemsContainer: function() {
            return this.isPickerVisible() ? this._picker.getContainer() : this._container;
         },

         setItems: function(list) {
            if(list) {
               /* RecordSet клонировать нельзя, иначе записи склонируются с ключевым полем
                  рекордсета, хотя оно могло быть изменено */
               if(!cInstance.instanceOfModule(list, 'WS.Data/Collection/RecordSet')) {
                  list = list.clone();
               } else {
                  list.setEventRaising(false, false);
               }
            } else {
               list = [];
            }
            FieldLinkItemsCollection.superclass.setItems.call(this, list);
         },

         /* Контрол не должен принимать фокус ни по клику, ни по табу */
         _initFocusCatch: fHelpers.nop,
         canAcceptFocus: fHelpers.nop,

         _drawItemsCallback: function() {
            if(this.isPickerVisible() && !this.getItems().getCount()) {
               this.hidePicker();
            }
         },

         showPicker: function() {
            this._clearItems();
            FieldLinkItemsCollection.superclass.showPicker.apply(this, arguments);
            this.redraw();
            this._picker.recalcPosition(true);
         },

         _setPickerContent: function () {
            var pickerContainer = this._picker.getContainer(),
                pickerWidth = this._parentFieldLink.getContainer()[0].offsetWidth - pickerContainer.outerWidth();
            pickerContainer.on('click', '.controls-FieldLink__item', this._onClickHandler.bind(this));
            /* Не очень правильное решение, пикер может сам менять ширину, поэтому устанавливаю минимальну и максимальную */
            pickerContainer[0].style.maxWidth = pickerWidth + 'px';
            pickerContainer[0].style.minWidth = pickerWidth + 'px';
            /* Зачем сделано:
               Не надо, чтобы пикер поля связи вызывал перерасчёт размеров,
               т.к. никаких расчётов при его показе не происходит, а просто отрисовываются элементы */
            this._picker._notifyOnSizeChanged = fHelpers.nop;
         },

         _setPickerConfig: function () {
            var self = this;
            return {
               corner: 'bl',
               target: this._parentFieldLink.getContainer(),
               opener: this._parentFieldLink,
               closeByExternalClick: true,
               targetPart: true,
               className: 'controls-FieldLink__picker',
               activableByClick: false,
               verticalAlign: {
                  side: 'top'
               },
               horizontalAlign: {
                  side: 'left'
               },
               handlers: {
                  /* Надо сообщить о закрытии пикера полю связи, а так же перерисовать элементы, но только после закрытия */
                  onClose: function() {
                     self._notify('onClosePicker');
                     setTimeout(self.redraw.bind(self), 0);
                  },
                  onShow: function() {
                     self._notify('onShowPicker');
                  }
               }
            };
         },

         destroy: function() {
            if (this._picker) {
               this._picker.getContainer().off('click');
            }
            FieldLinkItemsCollection.superclass.destroy.apply(this, arguments);
         }
      });

      return FieldLinkItemsCollection;

   });
