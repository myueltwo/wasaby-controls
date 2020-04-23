define('Controls-demo/CompatibleDemo/Compat/Wasaby/CreateControl/CreateControl', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/Compat/Wasaby/CreateControl/CreateControl',
], function(CompoundControl, template) {
   'use strict';

   var WasabyCreateDemo = CompoundControl.extend({
      _dotTplFn: template,
      _styles: ['Controls-demo/CompatibleDemo/CompatibleDemo'],

      init: function() {
         WasabyCreateDemo.superclass.init.call(this);
      },
      destroy: function() {
         WasabyCreateDemo.superclass.destroy.apply(this, arguments);
      }
   });
   return WasabyCreateDemo;
});
