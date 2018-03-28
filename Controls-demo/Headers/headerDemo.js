define('Controls-demo/Headers/headerDemo', [
   'Core/Control',
   'tmpl!Controls-demo/Headers/headerDemo',
   'css!Controls-demo/Headers/headerDemo'
], function (Control,
             template) {
   'use strict';


   var ModuleClass = Control.extend(
      {
         _template: template,
         _iconValue: false,
         _size: "l",
         _caption: 'test',
         _style: 'primary',
         _counterValue: undefined,
         _counterLocation: undefined,
         _counterStyle: undefined,
         _counterSize: undefined,
         _iconLocation: undefined,
         _iconStyle: undefined,
         _iconType: undefined,
         _separatorIconStyle: undefined,
         _commonClick: false,
         _separatorIcon: false,
         _iconClickable: false,
         _countClickable: false,
         _clickable: false,
         _backSize: undefined,
         _backCaption: 'Back',
         _backStyle: undefined,
         _inHeader: false,

         clickHandler: function (e) {
            console.log('Click');
         },

         clickCount: function (e) {
            console.log('clickCount');
         },

         iconCount: function (e) {
            console.log('iconCount');
            this._iconValue = !this._iconValue;
         }
      });
   return ModuleClass;
});