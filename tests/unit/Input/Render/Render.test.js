define(
   [
      'Core/_Util/Constants',
      'Controls/Utils/hasHorizontalScroll',
      'Controls/Input/resources/InputRender/InputRender',
      'Controls/Input/resources/InputRender/BaseViewModel'
   ],
   function(Constants, hasHorizontalScroll, Render, BaseViewModel) {

      'use strict';

      describe('Controls.Input.Render', function() {
         var render, viewModel, result;
         var saveFn = getComputedStyle;

         if (!Constants.isBrowserPlatform) {
            this.skip();
         }

         beforeEach(function() {
            result = undefined;
            viewModel = new BaseViewModel({
               value: ''
            });
            render = new Render();

            render._options = {
               viewModel: viewModel
            };
            render._children = {
               input: {
                  querySelector: function() {
                     return {};
                  }
               }
            };
            render._notify = function(eventName) {
               result = eventName;
            };

            getComputedStyle = function() {
               return {};
            };
         });

         afterEach(function() {
            getComputedStyle = saveFn;
         });

         describe('_inputHandler', function() {
            var event;

            beforeEach(function() {
               event = {
                  target: {
                     setSelectionRange: function() {}
                  },
                  nativeEvent: {}
               };
            });

            it('The value has changed', function() {
               event.target.value = '123';
               event.target.selectionStart = 3;
               event.target.selectionEnd = 3;
               render._inputHandler(event);
               assert.equal(result, 'valueChanged');
            });
            it('The value has not changed', function() {
               event.target.value = '';
               event.target.selectionStart = 0;
               event.target.selectionEnd = 0;
               render._inputHandler(event);
               assert.equal(result, undefined);
            });
         });
      });
   }
);
