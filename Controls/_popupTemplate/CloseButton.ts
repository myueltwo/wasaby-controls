import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_popupTemplate/CloseButton/CloseButton');
   /**
    * Кнопка для закрытия всплывающих окон и диалогов.
    *
    * @remark
    * Полезные ссылки:
    * * <a href="/materials/Controls-demo/app/Controls-demo%2FButtons%2FStandart%2FIndex">демо-пример</a>
    * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less">переменные тем оформления</a>
    *
    * @class Controls/_popupTemplate/CloseButton
    * @extends Core/Control
    * @control
    * @public
    * @author Красильников А.С.
    * @demo Controls-demo/PopupTemplate/CloseButton/ViewModes/Index
    * @mixes Controls/_buttons/interface/IClick
    *
    */

   /**
    * @name Controls/_popupTemplate/CloseButton#viewMode
    * @cfg {String} Устанавливает вид отображения кнопки.
    * @variant toolButton Отображение как кнопки панели инструментов.
    * @variant linkButton Отображение кнопки в виде ссылки.
    * @default toolButton
    * @example
    * Отображение в виде ссылки:
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="linkButton"/>
    * </pre>
    * Отображение как кнопки панели инструментов:
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="toolButton"/>
    * </pre>
    */

   /**
    * @name Controls/_popupTemplate/CloseButton#transparent
    * @cfg {String} Определяет фон кнопки.
    * @variant true Кнопке будет установлен прозрачный фон.
    * @variant false Кнопка имеет фон по умолчанию для этого режима отображения и стиля.
    * @default true
    * @example
    * Кнопка "Закрыть" с прозрачным фоном:
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="toolButton" transparent="{{true}}"/>
    * </pre>
    * Кнопка "Закрыть" с непрозрачным фоном.
    * <pre>
    *    <Controls.popupTemplate:CloseButton viewMode="toolButton" transparent="{{false}}"/>
    * </pre>
    */

class CloseButton extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   static _theme: string[] = ['Controls/popupTemplate'];

   static getDefaultOptions(): object {
      return {
         viewMode: 'toolButton',
         transparent: true
      };
   }
}

export default CloseButton;
