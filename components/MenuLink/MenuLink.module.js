define('js!SBIS3.CONTROLS.MenuLink', ['js!SBIS3.CONTROLS.Link', 'html!SBIS3.CONTROLS.MenuLink', 'js!SBIS3.CONTROLS.DSMixin', 'js!SBIS3.CONTROLS.PickerMixin', 'js!SBIS3.CONTROLS.MenuButtonMixin', 'js!SBIS3.CONTROLS.ContextMenu'], function(Link, dotTplFn, DSMixin, PickerMixin, MenuButtonMixin, ContextMenu) {

   'use strict';

   /**
    * Контрол, отображающий кнопку в виде ссылки и выпадающее из нее меню
    * @class SBIS3.CONTROLS.MenuLink
	* @demo SBIS3.CONTROLS.Demo.MyMenuLink
    * @extends SBIS3.CONTROLS.ButtonBase
    * @control
    * @author Крайнов Дмитрий Олегович
    * @initial
    * <component data-component='SBIS3.CONTROLS.MenuLink'>
    *    <option name='caption' value='Ссылка с меню'></option>
    *    <options name="items" type="array">
    *        <options>
    *            <option name="id">1</option>
    *            <option name="title">Пункт1</option>
    *         </options>
    *         <options>
    *            <option name="id">2</option>
    *            <option name="title">Пункт2</option>
    *         </options>
    *      </options>
    * </component>
    * @mixes SBIS3.CONTROLS.DSMixin
    * @mixes SBIS3.CONTROLS.PickerMixin
    * @mixes SBIS3.CONTROLS.MenuButtonMixin
    * @public
    * @category Buttons
    *
    * @ignoreOptions independentContext contextRestriction extendedTooltip validators
    * @ignoreOptions element linkedContext handlers parent autoHeight autoWidth horizontalAlignment
    * @ignoreOptions isContainerInsideParent owner stateKey subcontrol verticalAlignment
    *
    * @ignoreMethods activate activateFirstControl activateLastControl addPendingOperation changeControlTabIndex
    * @ignoreMethods applyEmptyState applyState findParent getAlignment getEventHandlers getEvents getExtendedTooltip
    * @ignoreMethods getId getLinkedContext getMinHeight getMinSize getMinWidth getOwner getOwnerId getParentByClass
    * @ignoreMethods getParentByName getParentByWindow getStateKey getTopParent getUserData hasEvent hasEventHandlers
    * @ignoreMethods isDestroyed isSubControl makeOwnerName once sendCommand setOwner setStateKey setUserData setValue
    * @ignoreMethods subscribe unbind unsubscribe
    *
    * @ignoreEvents onDragIn onDragMove onDragOut onDragStart onDragStop onStateChanged onTooltipContentRequest onChange
    * @ignoreEvents onBeforeShow onAfterShow onBeforeLoad onAfterLoad onBeforeControlsLoad onKeyPressed onResize
    * @ignoreEvents onFocusIn onFocusOut onReady onDragIn onDragStart onDragStop onDragMove onDragOut
    */

   var MenuLink = Link.extend( [PickerMixin, DSMixin, MenuButtonMixin], /** @lends SBIS3.CONTROLS.MenuLink.prototype */ {
      _dotTplFn: dotTplFn,
      $protected: {
         _zIndex: '',
         _options: {
            pickerClassName: 'controls-MenuLink__Menu'
         }
      },

      $constructor: function() {
         
      },

      init : function(){
         this.reload();
         MenuLink.superclass.init.call(this);
      },

      setCaption: function(caption){
         Link.superclass.setCaption.call(this, caption);
         $('.controls-Link__field', this._container).html(caption);
         if (this._picker){
            $('.controls-Menu__header-caption', this._picker._container).html(caption);
         }
      },

      _initializePicker: function(){
         MenuLink.superclass._initializePicker.call(this);
         this._setWidth();
      },

      _setWidth: function(){
         var self = this;
         this._picker.getContainer().css({
            'min-width': self._container.outerWidth() + 10 // + ширина стрелки
         });
      },

      _clickHandler: function(){
         if (this._dataSet.getCount() > 1) {
            this.togglePicker();
         } else {
            if (this._dataSet.getCount() == 1) {
               var id = this._dataSet.at(0).getKey();
               this._notify('onMenuItemActivate', id);
            }
         }
      },

      _dataLoadedCallback : function() {
         if (this._picker) this.hidePicker();
      },

      _drawIcon: function(icon) {
         var
            $icon = $('.controls-Link__icon', this._container.get(0)),
            $caption = $('.controls-Link__field', this._container.get(0));
         if (icon) {
            if ($icon.length) {
               $icon.get(0).className = 'controls-Link__icon ' + this._iconClass;
            }
            else {
               $icon = $('<i class="controls-Link__icon ' + this._iconClass + '"></i>');
               $caption.before($icon);
            }
         }
         else {
            $icon.remove();
         }
      }
   });

   return MenuLink;

});