/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Collection.IList', [
   "Core/IoC",
   "Core/ConsoleLogger",
   "js!WS.Data/Collection/IList"
], function ( IoC, ConsoleLogger,IList) {
   'use strict';
   IoC.resolve('ILogger').error('SBIS3.CONTROLS.Data.Collection.IList', 'Module is no longer available since version 3.7.4.100. Use WS.Data/Collection/IList instead.');
   return IList;
});
