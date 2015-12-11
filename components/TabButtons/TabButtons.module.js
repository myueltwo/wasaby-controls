/**
 * Created by iv.cheremushkin on 13.08.2014.
 */
define(
   'js!SBIS3.CONTROLS.TabButtons',
   [
      'js!SBIS3.CONTROLS.RadioGroupBase',
      'html!SBIS3.CONTROLS.TabButtons',
      'html!SBIS3.CONTROLS.TabButtons/ItemTpl',
      'js!SBIS3.CONTROLS.TabButton'
   ],
   function (RadioGroupBase, TabButtonsTpl, itemTpl) {

   'use strict';

   /**
    * Контрол, отображающий корешки закладок
    * Для оформления дополнительного текста 1 внутри вкладки нужно использовать класс <strong>controls-TabButton__additionalText1</strong>
    * Для оформления дополнительного текста 2 внутри вкладки нужно использовать класс <strong>controls-TabButton__additionalText2</strong>
    * @class SBIS3.CONTROLS.TabButtons
    * @extends SBIS3.CONTROLS.RadioGroupBase
    * @author Крайнов Дмитрий Олегович
    *
    * @cssModifier controls-TabButton__counter Для оформления вкладок-счётчиков с иконками
    * @cssModifier controls-TabButton__main-item Для оформления главной вкладки
    */

   var TabButtons = RadioGroupBase.extend(/** @lends SBIS3.CONTROLS.TabButtons.prototype */ {
      $protected: {
         _options: {
            /**
             * @cfg {String} Шаблон отображения каждого элемента коллекции
             * @example
             * <pre>
             *     <div class="tabButton">
             *        {{=it.item.get("caption")}}
             *     </div>
             * </pre>
             */
            itemTemplate: itemTpl
         }
      },
      _dotTplFn: TabButtonsTpl,

      $constructor: function () {
      },
      _getItemTemplate: function (item) {
         var displayField = this._options.displayField;
         return this._options.itemTemplate.call(this,
            {
               item: item,
               caption: item.get(displayField)
            }
         );
      }
   });
   return TabButtons;
});