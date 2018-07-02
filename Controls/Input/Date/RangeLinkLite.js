define('Controls/Input/Date/RangeLinkLite', [
   'Core/Control',
   'Core/core-merge',
   'Core/detection',
   'WS.Data/Type/descriptor',
   'Controls/Input/Date/interface/ILinkView',
   'Controls/Date/model/DateRange',
   'Controls/Calendar/Utils',
   'tmpl!Controls/Input/Date/RangeLinkLite/RangeLinkLite',
   'css!Controls/Input/Date/RangeLinkLite/RangeLinkLite'
], function(
   BaseControl,
   coreMerge,
   detection,
   types,
   ILinkView,
   DateRangeModel,
   CalendarControlsUtils,
   componentTmpl
) {

   'use strict';

   /**
    * A link button that displays the period. Supports the change of periods to adjacent.
    *
    * @class Controls/Input/Date/RangeLinkLite
    * @extends Core/Control
    * @mixes Controls/Input/Date/interface/ILinkView
    * @control
    * @public
    * @category Input
    * @author Миронов А.Ю.
    * @demo Controls-demo/Input/Date/RangeLinkLite
    *
    */

   var Component = BaseControl.extend({
      _template: componentTmpl,

      _rangeModel: null,

      _beforeMount: function(options) {
         this._rangeModel = new DateRangeModel();
         CalendarControlsUtils.proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged']);
         this._rangeModel.update(options);
      },

      _beforeUpdate: function(options) {
         this._rangeModel.update(options);
      },

      openDialog: function(event) {
         var className;

         if (this._options.showYears && !this._options.showMonths &&
            !this._options.showQuarters && !this._options.showHalfyears) {
            className = 'controls-DateRangeLinkLite__picker-years-only';
         } else {
            className = 'controls-DateRangeLinkLite__picker-normal';
         }

         this._children.opener.open({
            opener: this,
            target: this._container,
            className: className,
            eventHandlers: {
               onResult: this._onResult.bind(this)
            },
            templateOptions: {
               startValue: this._rangeModel.startValue,
               endValue: this._rangeModel.endValue,

               chooseMonths: this._options.chooseMonths,
               chooseQuarters: this._options.chooseQuarters,
               chooseHalfyears: this._options.chooseHalfyears,
               chooseYears: this._options.chooseYears,

               emptyCaption: this._options.emptyCaption
            }
         });
      },

      _onResult: function(startValue, endValue) {
         this._rangeModel.startValue = startValue;
         this._rangeModel.endValue = endValue;
         this._children.opener.close();
         this._forceUpdate();
      },

      _beforeUnmount: function() {
         this._rangeModel.destroy();
      }
   });

   Component.EMPTY_CAPTIONS = ILinkView.EMPTY_CAPTIONS;

   Component.getDefaultOptions = function() {
      return coreMerge({}, ILinkView.getDefaultOptions());
   };

   Component.getOptionTypes = function() {
      return coreMerge({}, ILinkView.getOptionTypes());
   };

   return Component;
});
