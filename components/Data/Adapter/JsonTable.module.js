/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Adapter.JsonTable', ['js!WS.Data.Adapter.JsonTable'], function (JsonTable) {
   'use strict';
   $ws.single.ioc.resolve('ILogger').error('SBIS3.CONTROLS.Data.Adapter.JsonTable', 'Module has been renamed in 3.7.4.100. Use WS.Data.Adapter.JsonTable instead');
   return JsonTable;
});
