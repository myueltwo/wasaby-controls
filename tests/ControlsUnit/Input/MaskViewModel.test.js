define(
   [
      'Core/core-merge',
      'Controls/_input/Mask/ViewModel'
   ],
   function(coreMerge, ViewModel) {

      'use strict';

      describe('Controls/_input/Mask/ViewModel', function() {
         var viewModel = new ViewModel({
               mask: 'DD.MM.YY',
               value: '',
               replacer: ' ',
               formatMaskChars: {
                  'D': '[0-9]',
                  'M': '[0-9]',
                  'Y': '[0-9]',
                  'H': '[0-9]',
                  'm': '[0-9]',
                  's': '[0-9]',
                  'U': '[0-9]'
               },
            }, ''), result;

         describe('_convertToDisplayValue', function() {
            it('value = null', function() {
               assert.equal(viewModel._convertToDisplayValue(null), '  .  .  ');
            });
         });
         describe('handleInput', function() {
            var splitValue = {
               after: '  .  .  ',
               before: '',
               delete: '',
               insert: '1'
            };
            viewModel.handleInput(splitValue, 'insert');
            assert.deepEqual(viewModel.value, '1     ');
         });

         describe('setCarriageDefaultPosition', function() {
            [{
               displayValue: '12.34.56',
               replacer: ' ',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.  ',
               replacer: ' ',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.56',
               replacer: ' ',
               currentPosition: 4,
               resp: 4
            }, {
               displayValue: '12.34.  ',
               replacer: ' ',
               currentPosition: 7,
               resp: 6
            }, {
               displayValue: '  .  .  ',
               replacer: ' ',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.56',
               replacer: '',
               currentPosition: undefined,
               resp: 8
            }, {
               displayValue: '12.34.',
               replacer: '',
               currentPosition: undefined,
               resp: 6
            }, {
               displayValue: '',
               replacer: '',
               currentPosition: 0,
               resp: 0
            }, {
               displayValue: '12.34.56',
               replacer: '',
               currentPosition: 3,
               resp: 3
            }].forEach(function(test) {
               it(`${test.displayValue}, ${test.replacer}, ${test.resp}`, function () {
                  var viewModel = new ViewModel({
                     mask: 'DD.MM.YY',
                     value: '',
                     replacer: test.replacer,
                     formatMaskChars: {
                        'D': '[0-9]',
                        'M': '[0-9]',
                        'Y': '[0-9]'
                     }
                  }, '');
                  viewModel.displayValue = test.displayValue;
                  viewModel.setCarriageDefaultPosition(test.currentPosition);
                  assert.equal(viewModel.selection.start, test.resp);
                  assert.equal(viewModel.selection.end, test.resp);
               });
            });
         });
      });
   }
);
