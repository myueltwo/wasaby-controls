/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/treeGrid:View дереве}.
 * @class Controls/treeGrid:ItemTemplate
 * @mixes Controls/list:BaseItemTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplate
 * @see Controls/interface/ITreeGridItemTemplate#itemTemplateProperty
 * @see Controls/treeGrid:View
 * @example
 * <pre class="brush: html">
 * <Controls.treeGrid:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/treeGrid:ItemTemplate" levelIndentSize="null" expanderSize="l" expanderIcon="node">
 *          <ws:contentTemplate>
 *             <div title="{{contentTemplate.itemData.item.Name}}">
 *                {{contentTemplate.itemData.item.Name}}
 *             </div>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.treeGrid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tree/templates/item/ здесь}.
 */


/**
 * @typedef {String} Size
 * @variant s Маленький размер.
 * @variant m Средний размер.
 * @variant l Большой размер.
 * @variant xl Очень большой размер.
 */

/**
 * @name Controls/treeGrid:ItemTemplate#expanderSize
 * @cfg {Size} Устанавливает размер иконки для узла и скрытого узла.
 * @default s
 * @see expanderIcon
 * @remark
 * Каждому значению опции соответствует размер в px. Он зависит от {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
 */

/**
 * @typedef {String} ExpanderIcon
 * @variant none Иконки всех узлов не отображаются.
 * @variant node Иконки всех узлов отображаются как иконки узлов.
 * @variant hiddenNode Иконки всех узлов отображаются как иконки скрытых узлов."
 */

/**
 * @name Controls/treeGrid:ItemTemplate#expanderIcon
 * @cfg {ExpanderIcon|undefined} Устанавливает стиль отображения иконки для узла и скрытого узла.
 * @default undefined
 * @remark
 * Когда в опции задано undefined, используются иконки узлов и скрытых узлов.
 * @see expanderSize
 */

/**
 * @name Controls/treeGrid:ItemTemplate#withoutLevelPadding
 * @cfg {Boolean} Когда опция установлена в значение true, в дереве отсутствуют структурные отступы для элементов иерархии.
 * @default false
 * @see levelIndentSize
 */

/**
 * @name Controls/treeGrid:ItemTemplate#levelIndentSize
 * @cfg {Size} Устанавливает размер структурного отступа для элементов иерархии.
 * @default s
 * @see withoutLevelPadding
 * @remark
 * Каждому значению опции соответствует размер в px. Он зависит от {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ темы оформления} приложения.
 */


export default interface IItemTemplateOptions {
   withoutLevelPadding?: boolean;
   expanderIcon?: string;
   expanderSize?: string;
   levelIndentSize?: string;
}