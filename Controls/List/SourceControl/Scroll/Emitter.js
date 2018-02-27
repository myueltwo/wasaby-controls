/**
 * Created by kraynovdo on 15.02.2018.
 */
define('Controls/List/SourceControl/Scroll/Emitter',
   [
      'Core/Control',
      'tmpl!Controls/List/SourceControl/Scroll/Emitter/Emitter',
      'WS.Data/Type/descriptor'
   ],
   function(Control, template, types) {

      'use strict';

      var ScrollEmitter = Control.extend({
         _template: template,



         startRegister: function(triggers) {
            this._notify("register", ['listScroll', this, this.handleScroll, triggers], {bubbling:true});
         },

         _beforeUnmount: function(){
            this._notify("unregister", [this._options.event, this], {bubbling:true});
         },
         handleScroll: function(){
            this._notify('emitListScroll', Array.prototype.slice.call(arguments));
         }
      });

      ScrollEmitter.getOptionTypes = function() {
         return {

         };
      };

      return ScrollEmitter;
   }
);
