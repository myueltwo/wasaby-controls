define('js!SBIS3.CONTROLS.DatePicker', ['js!SBIS3.CORE.Control'], function(Control) {

   'use strict';

   /**
    * Поле ввода даты. Дату можно ввести с клавиатуры или выбрать визуально из выпадающего календаря.
    * @class SBIS3.CONTROLS.DatePicker
    * @extends SBIS3.CORE.Control
    * @mixes SBIS3.CONTROLS._FormWidgetMixin
    * @mixes SBIS3.CONTROLS._PickerMixin
    * @control
    */

   var DatePicker = Control.Control.extend(/** @lends SBIS3.CONTROLS.DatePicker.prototype */{
      $protected: {
         _options: {

         }
      },

      $constructor: function() {

      }

   });

   return DatePicker;

});