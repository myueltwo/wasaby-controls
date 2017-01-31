/**
 * Created by iv.cheremushkin on 28.08.2014.
 */

define('js!SBIS3.CONTROLS.PasswordTextBox', [
   "Core/constants",
   "js!SBIS3.CONTROLS.TextBox",
   "tmpl!SBIS3.CONTROLS.PasswordTextBox"
], function ( constants,TextBox, dotTplFn) {

   'use strict';
   /**
    * Поле ввода пароля.
    * @class SBIS3.CONTROLS.PasswordTextBox
    * @extends SBIS3.CONTROLS.TextBox
    * @author Крайнов Дмитрий Олегович
    * @demo SBIS3.CONTROLS.Demo.MyPasswordTextBox
    *
    * @ignoreOptions independentContext contextRestriction isContainerInsideParent owner stateKey subcontrol textTransform
    * @ignoreOptions element linkedContext handlers parent autoHeight autoWidth horizontalAlignment verticalAlignment
    *
    * @ignoreMethods applyEmptyState applyState findParent getAlignment getEventHandlers getEvents getExtendedTooltip
    * @ignoreMethods getId getLinkedContext getMinHeight getMinSize getMinWidth getOwner getOwnerId getParentByClass
    * @ignoreMethods getParentByName getParentByWindow getStateKey getTopParent getUserData hasEvent hasEventHandlers
    * @ignoreMethods isDestroyed isSubControl makeOwnerName once sendCommand setOwner setStateKey setUserData setValue
    * @ignoreMethods subscribe unbind unsubscribe
    *
    * @ignoreEvents onDragIn onDragMove onDragOut onDragStart onDragStop onStateChanged onTooltipContentRequest onChange
    * @ignoreEvents onReady
    *
    * @public
    * @category Inputs
    * @control
    */
   var PasswordTextBox;
   PasswordTextBox = TextBox.extend(/** @lends SBIS3.CONTROLS.PasswordTextBox.prototype */ {
      _dotTplFn: dotTplFn,
      $constructor: function() {
         //TODO: избавиться от фикса высоты поля ввода пароля в IE>8
         if (constants.browser.isIE) {
            this.getContainer().find('.controls-TextBox__field').addClass('controls-TextBox__field__fixIE');
         }
      }
   });

   return PasswordTextBox;

});