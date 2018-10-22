define(
   'Controls/Indicator/Progress/Bar',
   [
      'Core/Control',
      'wml!Controls/Indicator/Progress/Bar/Bar',
      'WS.Data/Type/descriptor',

      'css!Controls/Indicator/Progress/Bar/Bar'
   ],
   function(
      Control,
      template,
      typeDescriptor
   ) {
      'use strict';

      /**
       * Control that renders progress bar
       *
       * @class Controls/Indicator/Progress/Bar
       * @extends Core/Control
       *
       * @public
       *
       * @author Baranov M.A.
       */


      /**
       * @name Controls/Indicator/Progress/Bar#percentValue
       * @cfg {Number} Width in percents of filled part of indicator
       */


      /**
       * @name Controls/Indicator/Progress/Bar#smoothChange
       * @cfg {Boolean} Animated indicator change
       */

      var
         Bar = Control.extend({
            _template: template
         });

      Bar.getOptionTypes = function() {
         return {
            percentValue: typeDescriptor(Number).required(),
            smoothChange: typeDescriptor(Boolean)
         };
      };

      Bar.getDefaultOptions = function() {
         return {
            percentValue: 0
         };
      };

      return Bar;
   }
);
