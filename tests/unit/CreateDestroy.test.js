/**
 * Created by dv.zuev on 18.05.2017.
 */
define([
   'js!WSDemo/TestSubControls/TestSubControlParent',
   'js!WSDemo/TestSubControls/LogicParentTestControl'
], function (
   ParentControl, LogicParentTestControl
) {
   'use strict';

   describe('CreateDestroy', function () {
      beforeEach(function () {
         if (typeof $ === 'undefined') {
            this.skip();
         }
      });
      describe('SubControls', function(){
         it('SubControls', function(done) {
            var parentControl = new ParentControl({
               element: $('<div></div>')
            });
            setTimeout(function () {
               assert.isTrue(!!parentControl.children.child);
               var a = parentControl.children.child;

               parentControl.destroy();
               assert.isTrue(a.isDestroyed());
               done();
            }, 0)

         });

         it('Parents', function(done) {
            var parentControl = new ParentControl({
               element: $('<div></div>')
            });
            setTimeout(function () {
               assert.isTrue(!!parentControl.children.child);
               var a = parentControl.children.child;

               parentControl.destroy();
               assert.isTrue(a.isDestroyed());
               done();
            }, 0)

         });

      });

   });

});
