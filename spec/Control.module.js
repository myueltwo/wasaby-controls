define('js!SBIS3.SPEC.Control', [
], function() {

   /**
    * Базовый класс компонента
    * @class SBIS3.SPEC.Control
    * @control
    * @public
    */



   /**
    * @name SBIS3.SPEC.Control#visible
    * @cfg {Boolean} Устанавливает видимость контрола.
    */

   /**
    * @name SBIS3.SPEC.Control#enabled
    * @cfg {Boolean} Устанавливает режим взаимодействия с контролом.
    */

   /**

   /**
    * Перевести фокус на компонент.
    * @function SBIS3.SPEC.Control#focus
    */

   /**
    * Увести фокус с компонента. Фокус будет переведен на body.
    * @function SBIS3.SPEC.Control#blur
    */

   /**
    * Возвращает признак наличия фокуса на корневом контейнере компонента.
    * @function SBIS3.SPEC.Control#isFocused
    * @returns {Boolean}
    */

   /**
    * Возвращает признак наличия фокуса на вложенном в компонент элементе.
    * @function SBIS3.SPEC.Control#hasFocus
    * @returns {Boolean}
    */

   /**
    * Возвращает признак активности компонента.
    * @function SBIS3.SPEC.Control#isEnabled
    * @returns {Boolean}
    */


   /**
    * Возвращает признак видимости компонента.
    * @function SBIS3.SPEC.Control#isVisible
    * @returns {Boolean}
    */

   /**
    * Перед отрисовкой контрола, перед mount контрола в DOM
    * Выполняется как на клиенте, так и на сервере. Здесь мы можем скорректировать наше состояние
    * в зависимости от параметров конструктора, которые были сохранены в _options
    * Вызывается один раз в течение жизненного цикла
    * На этом методе заканчивается управление жизненным циклом компонента на сервере.
    * После выполнения шаблонизации контрол будет разрушен и будет вызван _beforeDestroy
    * @function SBIS3.SPEC.Control#_beforeMount
    * @param {Object} options
    * @param {Object} receivedState
    * @private
    */

   /**
    * После отрисовки контрола. Выполняется на клиенте после синхронизации VDom с реальным Dom
    * Здесь мы можем впервые обратиться к DOMу, сделать какие-то асинхронные операции,
    * и при необходимости запланировать перерисовку
    * Вызывается один раз в течение жизненного цикла
    * Вызывается только на клиенте
    * @function SBIS3.SPEC.Control#_afterMount
    * @private
    */

   /**
    * Точка входа перед шаблонизацией. _beforeUpdate точка применения новых
    * опций для компонента. Здесь мы можем понять измененные опции и как-то повлиять на состяние
    * Вызывается множество раз за жизненный цикл
    * Вызывается только на клиенте
    * @function SBIS3.SPEC.Control#_beforeUpdate
    * @param {Object} newOptions - предыдущие опции компонента
    * @private
    */

   /**
    * Точка завершения шаблонизации и синхронизации. Здесь доступен DOM и
    * объект this._children
    * Здесь мы можем выполнить асинхронные операции, потрогать DOM
    * Вызывается каждый раз после шаблонизации после _beforeUpdate
    * Вызывается только на клиенте
    * @function SBIS3.SPEC.Control#_afterUpdate
    * @param {Object} oldOptions
    * @private
    */

   /**
    * Точка перед разрушением. Точка, когда компонент жив.
    * Здесь нужно разрушить объекты, которые были созданы в _applyOptions
    * Вызывается и на клиенте и на сервере
    * @function SBIS3.SPEC.Control#_beforeUnmount
    * @private
    */


   /**
    * Принудительный вызов обновления шаблонизатора
    * @function SBIS3.SPEC.Control#_forceUpdate
    * @private
    */

});