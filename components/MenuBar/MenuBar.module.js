/**
 * Created by iv.cheremushkin on 13.08.2014.
 */

define('js!SBIS3.CONTROLS.MenuBar', ['js!SBIS3.CORE.Control'], function( Control ) {

   'use strict';

   /**
    * Контрол, отображающий горизонтальное меню
    * @class SBIS3.CONTROLS.MenuBar
    * @extends SBIS3.CORE.Control
    * @mixes SBIS3.CONTROLS._CollectionMixin
    * @control
    */

   var MenuBar = Control.Control.extend( /** @lends SBIS3.CONTROLS.MenuBar.prototype */ {
      $protected: {
         _options: {

         }
      },

      $constructor: function() {

      }

   });

   return MenuBar;

});