/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Collection.IndexedEnumeratorMixin', ['js!WS.Data.Collection.IndexedEnumeratorMixin'], function (IndexedEnumeratorMixin) {
   'use strict';
   $ws.single.ioc.resolve('ILogger').error('SBIS3.CONTROLS.Data.Collection.IndexedEnumeratorMixin', 'Module has been renamed in 3.7.4.100. Use WS.Data.Collection.IndexedEnumeratorMixin instead');
   return IndexedEnumeratorMixin;
});
