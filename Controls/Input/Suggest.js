define('Controls/Input/Suggest',
   [
      'Core/Control',
      'tmpl!Controls/Input/Suggest/Suggest',
      'WS.Data/Type/descriptor',
      'Controls/Input/resources/InputRender/BaseViewModel',
      'css!Controls/Input/Suggest/Suggest'
   ],
   function(Control, template, types, BaseViewModel) {
      
      /**
       * Input that suggests options as you are typing.
       *
       * @class Controls/Input/Suggest
       * @extends Controls/Input/Text
       * @mixes Controls/Input/interface/ISearch
       * @mixes Controls/interface/ISource
       * @mixes Controls/interface/IFilter
       * @mixes Controls/Input/interface/ISuggest
       * @mixes Controls/interface/INavigation
       * @control
       * @public
       * @category Input
       */
      
      'use strict';
      
      var _private = {
         initViewModel: function(self, options) {
            self._simpleViewModel = new BaseViewModel({
               value: options.value
            });
         }
      };
      
      var Suggest = Control.extend({
         
         _template: template,
         
         _suggestState: false,
         _searchState: false,
         
         // <editor-fold desc="LifeCycle">
         
         constructor: function(options) {
            Suggest.superclass.constructor.call(this, options);
            _private.initViewModel(this, options || {});
         },
         
         _beforeUpdate: function(newOptions) {
            this._simpleViewModel.updateOptions({
               value: newOptions.value
            });
         },
         
         // </editor-fold>
         
         
         // <editor-fold desc="handlers">
         
         _changeValueHandler: function(event, value) {
            this._notify('valueChanged', [value]);
         },
         
         _choose: function(event, item) {
            /* move focus to input after select, because focus will be lost after closing popup  */
            this.activate();
            this._notify('choose', [item]);
            this._notify('valueChanged', [item.get(this._options.displayProperty)]);
         },
         
         _clearClick: function() {
            /* move focus to input after clear text, because focus will be lost after hiding cross  */
            this.activate();
            this._suggestState = false;
            this._notify('valueChanged', ['']);
         },
   
         _searchStart: function() {
            this._searchState = true;
         },
         
         _searchEnd: function() {
            this._searchState = false;
         }
         
         // </editor-fold>
         
      });
      
      
      // <editor-fold desc="OptionsDesc">
      
      Suggest.getOptionTypes = function() {
         return {
            displayProperty: types(String).required(),
            suggestTemplate: types(Array).required()
         };
      };
   
      Suggest.getDefaultOptions = function() {
         return {
            minSearchLength: 3
         };
      };
      
      // </editor-fold>
      
      Suggest._private = _private;
      return Suggest;
   }
);
