/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Adapter.JsonFormatMixin', ['js!WS.Data.Adapter.JsonFormatMixin'], function (JsonFormatMixin) {
   'use strict';
   $ws.single.ioc.resolve('ILogger').error('SBIS3.CONTROLS.Data.Adapter.JsonFormatMixin', 'Module has been renamed in 3.7.4.100. Use WS.Data.Adapter.JsonFormatMixin instead');
   return JsonFormatMixin;
});
