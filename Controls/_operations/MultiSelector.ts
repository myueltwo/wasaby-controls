import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import template = require('wml!Controls/_operations/MultiSelector/MultiSelector');
import {IMultiSelectableOptions} from 'Controls/interface';

/**
 * Контрол, который отображает выпадающий список,
 * позволяющий производить массовую отметку записей в списке: отмечать все записи, инвертировать, снимать отметку.
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 * @class Controls/_operations/MultiSelector
 * @extends Core/Control
 * @control
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/operations/MultiSelector/Index
 */
export interface IMultiSelectorOptions extends IMultiSelectableOptions, IControlOptions {
    isAllSelected: boolean;
    selectedKeysCount: number | null;
}

class MultiSelector extends Control<IMultiSelectorOptions> {
    protected _template: TemplateFunction = template;
    static _theme: string[] = ['Controls/operations'];
}

export default MultiSelector;
