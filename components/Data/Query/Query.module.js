/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Query.Query', [
   "Core/IoC",
   "Core/ConsoleLogger",
   "js!WS.Data/Query/Query"
], function ( IoC, ConsoleLogger,Query) {
   'use strict';
   IoC.resolve('ILogger').error('SBIS3.CONTROLS.Data.Query.Query', 'Module is no longer available since version 3.7.4.100. Use WS.Data/Query/Query instead.');
   return Query;
});
