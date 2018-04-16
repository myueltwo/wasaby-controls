define('Controls/Input/Number', [
   'Core/Control',
   'tmpl!Controls/Input/Number/Number',
   'WS.Data/Type/descriptor',
   'Controls/Input/Number/ViewModel',
   'Controls/Input/resources/InputHelper',
   'Core/helpers/Function/runDelayed',

   'Controls/Input/resources/InputRender/InputRender',
   'tmpl!Controls/Input/resources/input'
], function(Control,
   template,
   types,
   NumberViewModel,
   inputHelper,
   runDelayed) {

   'use strict';
   var
      _private,
      NumberInput;

   _private = {
   };

   NumberInput = Control.extend({

      /**
       * Поле ввода числа.
       * @class Controls/Input/Number
       * @extends Controls/Control
       * @mixes Controls/Input/interface/IInputNumber
       * @mixes Controls/Input/interface/IInputPlaceholder
       * @mixes Controls/Input/interface/IValidation
       * @mixes Controls/Input/interface/IInputTag
       * @control
       * @public
       * @category Input
       * @author Баранов М.А.
       * @demo Controls-demo/Input/Number/Number
       */

      /**
       * @name Controls/Input/Number#precision
       * @cfg {Number} Количество знаков после запятой
       */

      /**
       * @name Controls/Input/Number#onlyPositive
       * @cfg {Boolean} Ввод только положительных чисел
       */

      /**
       * @name Controls/Input/Number#integersLength
       * @cfg {Number} Количество знаков до запятой
       */

      /**
       * @name Controls/Input/Number#showEmptyDecimals
       * @cfg {Boolean} Показывать нулевую дробную часть
       */

      _template: template,

      _caretPosition: null,

      constructor: function(options) {
         NumberInput.superclass.constructor.apply(this, arguments);

         this._numberViewModel = new NumberViewModel({
            onlyPositive: options.onlyPositive,
            integersLength: options.integersLength,
            precision: options.precision,
            showEmptyDecimals: options.showEmptyDecimals,
            value: String(options.value)
         });
      },

      _beforeUpdate: function(newOptions) {
         this._numberViewModel.updateOptions({
            onlyPositive: newOptions.onlyPositive,
            integersLength: newOptions.integersLength,
            precision: newOptions.precision,
            showEmptyDecimals: newOptions.showEmptyDecimals,
            value: this._options.value === newOptions.value ? this._numberViewModel.getValue() : String(newOptions.value)
         });
      },

      _afterUpdate: function(oldOptions) {
         if ((oldOptions.value !== this._numberViewModel.getValue()) && this._caretPosition) {
            this._children['input'].setSelectionRange(this._caretPosition, this._caretPosition);
            this._caretPosition = null;
         }
      },

      _inputCompletedHandler: function(event, value) {
         this._notify('inputCompleted', [this._getNumericValue(value)]);
      },

      _notifyHandler: function(event, value) {
         this._notify(value);
      },

      _valueChangedHandler: function(e, value) {
         this._notify('valueChanged', [this._getNumericValue(value)]);
      },

      /**
       * Transforms value with delimiters into number
       * @param value
       * @return {*}
       * @private
       */
      _getNumericValue: function(value) {
         var
            val = parseFloat(value.replace(/ /g, ''));
         return isNaN(val) ? undefined : val;
      },

      _focusoutHandler: function() {
         if (this._numberViewModel.getValue() === '0.0') {
            this._numberViewModel.updateValue('0');
            this._children['inputRender']._oldValue = '0';
         } else if (!this._options.showEmptyDecimals) {
            var
               i,
               emptyCount = 0,
               value = this._numberViewModel.getValue(),
               processedValue;

            if (value.indexOf('.') !== -1) {
               for (i = value.length - 1; i >= 0; i--) {
                  if (value[i] !== '0' || value[i] === '.') {
                     break;
                  }

                  if (value[i] === '0') {
                     emptyCount++;
                  }
               }

               if (emptyCount !== 0) {
                  processedValue = value.slice(0, -emptyCount);

                  if (processedValue[processedValue.length - 1] === '.') {
                     processedValue = processedValue.slice(0, -1);
                  }

                  this._numberViewModel.updateValue(processedValue);
               }
            }
         }
      },

      paste: function(text) {
         this._caretPosition = inputHelper.pasteHelper(this._children['inputRender'], this._children['realArea'], text);
      }
   });

   NumberInput.getOptionTypes = function() {
      return {
         precision: types(Number), //Точность (кол-во знаков после запятой)
         integersLength: types(Number), //Длина целой части
         onlyPositive: types(Boolean) //Только положительные значения
      };
   };

   return NumberInput;
});
