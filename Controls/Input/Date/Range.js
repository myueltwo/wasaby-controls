define('Controls/Input/Date/Range', [
   'Core/Control',
   'Core/core-merge',
   'Controls/Calendar/Utils',
   'Controls/Date/model/DateRange',
   'Controls/Input/interface/IDateTimeMask',
   'Controls/Utils/tmplNotify',
   'wml!Controls/Input/Date/Range/Range',
   'css!Controls/Input/Date/Range/Range'
], function(
   Control,
   coreMerge,
   CalendarControlsUtils,
   DateRangeModel,
   IDateTimeMask,
   tmplNotify,
   template
) {

   /**
    * Control for entering date range.
    * @class Controls/Input/Date/Range
    * @mixes Controls/Date/interface/IRange
    * @mixes Controls/Input/interface/IInputDateRange
    * @mixes Controls/Input/interface/IDateMask
    * @mixes Controls/Input/interface/IValidation
    * @control
    * @public
    * @category Input
    */

   var Component = Control.extend([], {
      _template: template,
      _proxyEvent: tmplNotify,

      _rangeModel: null,

      _beforeMount: function(options) {
         this._rangeModel = new DateRangeModel();
         this._rangeModel.update(options);
         CalendarControlsUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
      },

      _beforeUpdate: function(options) {
         this._rangeModel.update(options);
      },

      _beforeUnmount: function() {
         this._rangeModel.destroy();
      },

      _openDialog: function(event) {
         this._children.opener.open({
            opener: this,
            target: this._container,
            className: 'controls-PeriodDialog__picker',
            horizontalAlign: { side: 'right' },
            corner: { horizontal: 'left' },
            eventHandlers: {
               onResult: this._onResult.bind(this)
            },
            templateOptions: {
               startValue: this._rangeModel.startValue,
               endValue: this._rangeModel.endValue,
               selectionType: this._options.selectionType,
               quantum: this._options.quantum,
               headerType: 'input'
            }
         });
      },

      _onResult: function(startValue, endValue) {
         this._rangeModel.startValue = startValue;
         this._rangeModel.endValue = endValue;
         this._children.opener.close();
         this._forceUpdate();
      }
   });

   Component.getDefaultOptions = function() {
      return coreMerge({}, IDateTimeMask.getDefaultOptions());
   };

   Component.getOptionTypes = function() {
      return coreMerge({}, IDateTimeMask.getOptionTypes());
   };

   return Component;

});
