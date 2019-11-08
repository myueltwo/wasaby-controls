/**
 * Утилита для простых операция с массивом, таких как:
 * - Получение индекса элемента
 * - Получение индекса элемента с проверкой по типу (String/Integer)
 * - Проверка наличия элемента в массиве
 */
define('Controls/Utils/ArraySimpleValuesUtil', [], function() {

   'use strict';

   var CONSTRUCTORS_FOR_TYPE_INVERTING = {
      string: Number,
      number: String
   };

   return {
      hasInArray: function(array, elem) {
         return this.invertTypeIndexOf(array, elem) !== -1;
      },

      invertTypeIndexOf: function(array, elem) {
         var index = array.indexOf(elem);

         if (index === -1) {
            var elementType = typeof elem;

            // Данная утилита используется для операций с массивами,
            // в которых могут лежать любые типы данных.
            // Инвертировать тип необходимо только для строк и чисел.
            // Для остальных типов данных это не имеет смысла и только вызывает тормоза
            if (CONSTRUCTORS_FOR_TYPE_INVERTING[elementType]) {
               index = array.indexOf(CONSTRUCTORS_FOR_TYPE_INVERTING[elementType](elem));
            }
         }

         return index;
      },

      addSubArray: function(array, items) {
         items.forEach(function(item) {
            if (!this.hasInArray(array, item)) {
               array.push(item);
            }
         }, this);
      },

      removeSubArray: function(array, items) {
         var index;
         items.forEach(function(item) {
            index = this.invertTypeIndexOf(array, item);
            if (index !== -1) {
               array.splice(index, 1);
            }
         }, this);
      },

      /**
       * Сравнивает два массива, возвращает разницу между ними
       * @param arrayOne
       * @param arrayTwo
       * @returns {{added: Array, removed: Array}}
       */
      getArrayDifference: function(arrayOne, arrayTwo) {
         var
            result = {},
            self = this;

         result.removed = arrayOne.filter(function(item) {
            return !self.hasInArray(arrayTwo, item);
         });

         result.added = arrayTwo.filter(function(item) {
            return !self.hasInArray(arrayOne, item);
         });

         return result;
      }

   };
});
