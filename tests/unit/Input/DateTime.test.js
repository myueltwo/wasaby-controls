define([
   'Core/core-merge',
   'Controls/Input/DateTime',
   'Controls/Input/DateTime/StringValueConverter',
   'unit/Calendar/Utils',
   'Core/constants'
], function(
   cMerge,
   DateTime,
   StringValueConverter,
   calendarTestUtils,
   constants
) {
   'use strict';

   const options = {
      mask: 'DD.MM.YYYY',
      value: new Date(2018, 0, 1),
      replacer: ' ',
   };

   describe('Controls/Input/DateTime', function() {
      describe('Initialisation', function() {
         it('should create correct model', function() {
            const component = calendarTestUtils.createComponent(DateTime, options);
            assert(component._model);
            assert.strictEqual(component._model._mask, options.mask);
            assert.strictEqual(component._model.value, options.value);
            assert.strictEqual(component._model._lastValue, options.value);
            assert.strictEqual(component._model.textValue, '01.01.2018');
         });

      });

      describe('_beforeUpdate', function() {
         it('should update the model', function() {
            const component = calendarTestUtils.createComponent(DateTime, options),
               value = new Date(2017, 11, 1);

            component._beforeUpdate(cMerge({ value: value }, options, { preferSource: true }));

            assert.strictEqual(component._model.value, value);
            assert.strictEqual(component._model.textValue, '01.12.2017');
         });
      });

      describe('_inputCompletedHandler', function() {
         it('should update model and generate events', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(DateTime, options),
               textValue = '01.12.2017',
               value = new Date(2017, 11, 1);

            sandbox.stub(component, '_notify');
            component._inputCompletedHandler(null, '01122017', textValue);

            assert.strictEqual(component._model.value.getTime(), value.getTime());
            assert.strictEqual(component._model.textValue, textValue);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.calledWith(component._notify, 'inputCompleted');

            sandbox.restore();
         });
      });

      describe('_valueChangedHandler', function() {
         it('should update the model', function() {
            const sandbox = sinon.sandbox.create(),
               event = {
                  stopImmediatePropagation: sinon.fake()
               },
               component = calendarTestUtils.createComponent(DateTime, options),
               textValue = '01.12.2017',
               value = new Date(2017, 11, 1);

            sandbox.stub(component, '_notify');
            component._valueChangedHandler(event, '01122017', textValue);

            assert.strictEqual(component._model.value.getTime(), value.getTime());
            assert.strictEqual(component._model.textValue, textValue);

            sinon.assert.calledWith(component._notify, 'valueChanged');
            sinon.assert.called(event.stopImmediatePropagation);

            sandbox.restore();
         });
      });

      describe('_beforeUnmount', function() {
         it('should destroy the model', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(DateTime, options);

            sandbox.stub(component._model, 'destroy');
            component._beforeUnmount();

            sinon.assert.calledOnce(component._model.destroy);

            sandbox.restore();
         });
      });

      describe('_onKeyDown', function() {
         it('should set current date on insert key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(DateTime, options),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.insert
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            component._onKeyDown(event);
            const model = component._model;
            const converter = new StringValueConverter();
            assert.deepEqual(model.value, converter.getCurrentDate(model._lastValue, model._mask));
            sandbox.restore();
         });

         it('should increase current date on one day by plus key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(DateTime, options),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.plus
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            const model = component._model;
            const converter = new StringValueConverter();
            const currentDate = converter.getCurrentDate(model._lastValue, model._mask);
            model.value = currentDate;
            component._onKeyDown(event);
            const localDate = new Date(currentDate);
            localDate.setDate(localDate.getDate() + 1);
            assert.deepEqual(model.value, localDate);
            sandbox.restore();
         });

         it('should decrease current date on one day by minus key press', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(DateTime, options),
               event = {
                  nativeEvent: {
                     keyCode: constants.key.minus
                  },
                  stopImmediatePropagation: sinon.fake()
               };
            const model = component._model;
            const converter = new StringValueConverter();
            const currentDate = converter.getCurrentDate(model._lastValue, model._mask);
            model.value = currentDate;
            component._onKeyDown(event);
            const localDate = new Date(currentDate);
            localDate.setDate(localDate.getDate() - 1);
            assert.deepEqual(model.value, localDate);
            sandbox.restore();
         });
      });
   });
});
