/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Model', [
   "Core/IoC",
   "Core/ConsoleLogger",
   "js!WS.Data/Entity/Model"
], function ( IoC, ConsoleLogger,Model) {
   'use strict';
   IoC.resolve('ILogger').error('SBIS3.CONTROLS.Data.Model', 'Module is no longer available since version 3.7.4.100. Use WS.Data/Entity/Model instead.');
   return Model;
});
