/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Adapter.SbisFormatMixin', ['js!WS.Data.Adapter.SbisFormatMixin'], function (SbisFormatMixin) {
   'use strict';
   $ws.single.ioc.resolve('ILogger').error('SBIS3.CONTROLS.Data.Adapter.SbisFormatMixin', 'Module has been renamed in 3.7.4.100. Use WS.Data.Adapter.SbisFormatMixin instead');
   return SbisFormatMixin;
});
