define(
   [
      'Core/Control',
      'js!Controls/Input/Search'
   ],
   function (Control, Search) {
      'use strict';

      var
         isSearched = false,
         isReseted = false,
         search;

      describe('Controls/Input/Search', function () {

         before(function () {
            if (typeof $ === 'undefined') {
               this.skip();
            }
            var container = $('<div></div>');
            $('#mocha').append(container);

            search = Control.createControl(Search, {element: container}, container);
            search.subscribe('search', function () {
               isSearched = true;
            });
            search.subscribe('reset', function () {
               isReseted = true;
            });
         });

         beforeEach(function () {
            if(typeof $==='undefined') {
               this.skip();
            }
         });

         after(function () {
            if (typeof $ !== 'undefined') {
               search.destroy();
            }
         });

         describe('search', function () {

            it('Click on reset', function () {
               isSearched = false;
               isReseted = false;
               search._onResetClick();
               assert.isTrue(isReseted);
               assert.isFalse(isSearched);
            });

            it('Click on search', function () {
               isSearched = false;
               isReseted = false;
               search._onSearchClick();
               assert.isTrue(isSearched);
               assert.isFalse(isReseted);
            });
         });
      });
   });