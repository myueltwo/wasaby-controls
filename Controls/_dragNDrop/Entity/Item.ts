import Entity = require('Controls/_dragNDrop/Entity');
      

      var Item = Entity.extend({
         getItem: function() {
            return this._options.item;
         }
      });

      export = Item;
   
