/**
 * TODO Компонент пока тестировался только в Chrome
 */
define(
   'js!SBIS3.CONTROLS.DatePicker',
   [
      'js!SBIS3.CONTROLS.DateBox',
      'js!SBIS3.CONTROLS.PickerMixin',
      'js!SBIS3.CONTROLS.Utils.DateUtil',
      'js!SBIS3.CONTROLS.DateRangeBigChoose',
      'html!SBIS3.CONTROLS.DatePicker',
      'i18n!SBIS3.CONTROLS.DatePicker'
   ],
   function (DateBox, PickerMixin, DateUtil, DateRangeBigChoose, dotTplFn) {

   'use strict';

   /**
    * Поле ввода даты/времени.
    * Данный контрол предназначен для осуществления ввода информации о дате и времени.
    * В зависимости от {@link mask маски} возвожен ввод:
    * <ol>
    *    <li>только даты,</li>
    *    <li>только времени,</li>
    *    <li>даты и времени.</li>
    * </ol>
    * Осуществить ввод информации можно как с клавиатуры, так и выбором на календаре, который открывается кликом по соответствующей иконке.
    * Можно вводить только значения особого формата даты.
    * @class SBIS3.CONTROLS.DatePicker
    * @extends SBIS3.CONTROLS.FormattedTextBoxBase
    * @demo SBIS3.CONTROLS.Demo.MyDatePicker
    * @author Крайнов Дмитрий Олегович
    *
    * @control
    * @public
    * @category Date/Time
    */

   var DatePicker = DateBox.extend([PickerMixin], /** @lends SBIS3.CONTROLS.DatePicker.prototype */{
       /**
        * @event onDateChange Происходит при изменении даты.
        * @remark
        * Изменение даты производится одним из трёх способов:
        * 1. через выбор в календаре;
        * 2. через установку нового значения в поле ввода с клавиатуры;
        * 3. методами {@link setText} или {@link setDate}.
        * @param {$ws.proto.EventObject} eventObject Дескриптор события.
        * @param {Date} date Дата, которую установили.
        * @example
        * <pre>
        *    var dateChangeFn = function(event) {
        *       if (this.getDate().getTime() < minDate.getTime()) {
        *          buttonSend.setEnabled(false);
        *          title.setText('Указана прошедшая дата: проверьте нет ли ошибки');
        *       }
        *    };
        *    datePicker.subscribe('onDateChange', dateChangeFn);
        * </pre>
        */
      /**
       * @event onDateSelect Происходит при окончании выбора даты.
       * @remark
       * Окончанием выбора даты является уход фокуса из поля ввода, на не дочерние контролы.
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       * @param {Date} date Дата, которую установили.
       */
      $protected: {
         _dotTplFn: dotTplFn,
         /**
          * Контролл Calendar в пикере
          */
         _calendarControl: undefined,
         /**
          * Опции создаваемого контролла
          */
         _options: {
            /**
             * @cfg {Boolean} Показана ли иконка календарика.
             * @remark
             * Если {@link mask маска} представляет собой только время, то автоматически иконка календарика прячется, т.е. значение
             * опции самостоятельно сменится на false.
             * @example
             * <pre>
             *     <option name="isCalendarIconShown">false</option>
             * </pre>
             * @see date
             * @see mask
             * @see setDate
             * @deprecated
             */
            isCalendarIconShown: true,

            pickerConfig: {
               corner: 'tl',
               horizontalAlign: {
                  side: 'right',
                  offset: 145
               },
               verticalAlign: {
                  side: 'top',
                  offset: -11
               }
            }
         },
         _onFocusInHandler: undefined
      },

      $constructor: function () {
         this._publish('onDateChange', 'onDateSelect', 'onFocusOut');
      },

      init: function () {
         DatePicker.superclass.init.call(this);

         // Проверить тип маски -- дата, время или и дата, и время. В случае времени -- сделать isCalendarIconShown = false
         this._checkTypeOfMask(this._options);

         this._calendarInit();

         this._container.removeClass('ws-area');
      },

      _modifyOptions : function(options) {
         this._checkTypeOfMask(options);
         return DatePicker.superclass._modifyOptions.apply(this, arguments);
      },

      /**
       * Инициализация календарика
       */
      _calendarInit: function() {
         var self = this,
            button = this.getChildControlByName('CalendarButton');
         if (self._options.isCalendarIconShown) {
            // Клик по иконке календарика
            button.subscribe('onActivated', function () {
               if (self.isEnabled()) {
                  self.togglePicker();

                  // Если календарь открыт данным кликом - обновляем календарь в соответствии с хранимым значением даты
                  if (self._picker.isVisible() && self.getDate()) {
                     self._chooserControl.setStartValue(self.getDate());
                  }
               }
            });
         } else {
            button.getContainer().parent().addClass('ws-hidden');
         }
      },

      _setEnabled : function(enabled) {
         DatePicker.superclass._setEnabled.call(this, enabled);
         if (this._picker && this._picker.isVisible()){
            this.hidePicker();
         }
      },

      /**
       * Определение контента пикера. Переопределённый метод
       * @private
       */
      _setPickerContent: function() {
         var self = this,
            // Создаем пустой контейнер
            element = $('<div name= "Calendar" class="controls-DatePicker__calendar"></div>');

         this._picker.getContainer().empty();
         // Преобразуем контейнер в контролл Calendar и запоминаем
         self._chooserControl = new DateRangeBigChoose({
            parent: this._picker,
            element: element,
            rangeselect: false,
            startValue: this.getDate(),
            endValue: this.getDate()
         });

         // Добавляем в пикер
         this._picker.getContainer().append(element);

         // Нажатие на календарный день в пикере устанавливает дату
         this._chooserControl.subscribe('onChoose', this._onChooserChange.bind(this));
         this._chooserControl.subscribe('onCancel', this._onChooserClose.bind(this));
         // this._chooserControl.subscribe('onDateChange', function(eventObject, date) {
         //    self.setDate(date);
         //    self.hidePicker();
         // });
      },

      _onChooserChange: function(event, date) {
         this.setDate(date);
         this.hidePicker();
      },
      _onChooserClose: function(event) {
         this.hidePicker();
      },

      /**
       * Проверить тип даты. Скрыть иконку календаря, если отсутствуют день, месяц и год (т.е. присутствует только время)
       * @private
       */
      _checkTypeOfMask: function (options) {
         if (options.mask  &&  !/[DMY]/.test(options.mask) ) {
            options.isCalendarIconShown = false;
         }
      },

      setActive: function(active) {
         if (active) {
            this._initFocusInHandler();
         }
         DatePicker.superclass.setActive.apply(this, arguments);
      },

      _initFocusInHandler: function() {
         if (!this._onFocusInHandler) {
            this._onFocusInHandler = this._onFocusIn.bind(this);
            this.subscribeTo($ws.single.EventBusGlobalChannel, 'onFocusIn', this._onFocusInHandler);
         }
      },

      _onFocusIn: function(event) {
         if (!$ws.helpers.isChildControl(this, event.getTarget())) {
            this._notify('onDateSelect');
            this.unsubscribeFrom($ws.single.EventBusGlobalChannel, 'onFocusIn', this._onFocusInHandler);
            this._onFocusInHandler = null;
         }
      }
   });

   return DatePicker;
});