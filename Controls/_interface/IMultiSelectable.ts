export interface IMultiSelectableOptions {
    selectedKeys?: any;
}

/**
 * Интерфейс для поддержки выбора элементов в списках, где одновременно можно выбрать несколько элементов и известно количество выбранных элементов. Этот интерфейс подходит для небольших списков, где все элементы будут всегда загружены.
 * @interface Controls/_interface/IMultiSelectable
 * @public
 * @author Герасимов А.М.
 * @see Controls/_interface/ISingleSelectable
 * @see Controls/interface/IPromisedSelectable
 */

/*
 * Interface for item selection in lists where multiple items can be selected at a time and the number of selected items is known. This interface is suitable for small lists where all items are always loaded.
 * @interface Controls/_interface/IMultiSelectable
 * @public
 * @author Герасимов А.М.
 * @see Controls/_interface/ISingleSelectable
 * @see Controls/interface/IPromisedSelectable
 */
export default interface IMultiSelectable {
    readonly '[Controls/_interface/IMultiSelectable]': boolean;
}

/**
 * @name Controls/_interface/IMultiSelectable#selectedKeys
 * @cfg {Array.<Number|String>} Массив ключей выбранных элементов.
 * @default []
 * @example
 * В следующем примере создается список и устанавливается опция selectedKeys со значением [1, 2, 3]. Последующие изменения, внесенные в selectedKeys, будут синхронизированы посредством биндинга.
 * TMPL:
 * <pre>
 *    <Controls.list:View bind:selectedKeys="_selectedKeys" />
 * </pre>
 * JS:
 * <pre>
 *    _beforeMount: function() {
 *       this._selectedKeys = [1, 2, 3];
 *    }
 * </pre>
 * @see Controls/_interface/ISource#keyProperty
 * @see selectedKeysChanged
 */

/*
 * @name Controls/_interface/IMultiSelectable#selectedKeys
 * @cfg {Array.<Number|String>} Array of selected items' keys.
 * @default []
 * @example
 * The following example creates List and sets the selectedKeys to [1, 2, 3]. Subsequent changes made to selectedKeys will be synchronized through binding mechanism.
 * TMPL:
 * <pre>
 *    <Controls.list:View bind:selectedKeys="_selectedKeys" />
 * </pre>
 * JS:
 * <pre>
 *    _beforeMount: function() {
 *       this._selectedKeys = [1, 2, 3];
 *    }
 * </pre>
 * @see Controls/_interface/ISource#keyProperty
 * @see selectedKeysChanged
 */

/**
 * @event Controls/_interface/IMultiSelectable#selectedKeysChanged Происходит при изменении выбранных элементов.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} keys Массив ключей выбранных элементов.
 * @param {Array.<Number|String>} added Массив ключей элементов, добавленных к выборке.
 * @param {Array.<Number|String>} deleted Массив ключей элементов, удаленных из выборки.
 * @remark
 * Важно помнить, что мы не мутируем массив selectedKeys из опций (или любой другой опции). Таким образом, ключи в аргументах события и selectedKeys в параметрах контрола не являются одним и тем же массивом.
 * @example
 * В следующем примере создается список и устанавливается опция selectedKeys со значением [1, 2, 3], а также показано, как изменить сообщение, выведенное пользователю на основе выбора.
 * TMPL:
 * <pre>
 *    <Controls.list:View on:selectedKeysChanged="onSelectedKeysChanged()" selectedKeys="{{ _selectedKeys }}" />
 *    <h1>{{ _message }}</h1>
 * </pre>
 * JS:
 * <pre>
 *     _beforeMount: function() {
 *       this._selectedKeys = [1, 2, 3];
 *    },
 *    onSelectedKeysChanged: function(e, keys, added, deleted) {
 *       this._selectedKeys = keys; //We don't use binding in this example so we have to update state manually.
 *       if (keys.length > 0) {
 *          this._message = 'Selected ' + keys.length + ' items.';
 *       } else {
 *          this._message = 'You have not selected any items.';
 *       }
 *    }
 * </pre>
 * @see Controls/_interface/ISource#keyProperty
 * @see selectedKeys
 */

/*
 * @event Controls/_interface/IMultiSelectable#selectedKeysChanged Occurs when selected keys were changed.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Array.<Number|String>} keys Array of selected items' keys.
 * @param {Array.<Number|String>} added Array of keys added to selection.
 * @param {Array.<Number|String>} deleted Array of keys deleted from selection.
 * @remark
 * It's important to remember that we don't mutate selectedKeys array from options (or any other option). So keys in the event arguments and selectedKeys in the component's options are not the same array.
 * @example
 * The following example creates List, sets the selectedKeys to [1, 2, 3] and shows how to change message shown to the user based on selection.
 * TMPL:
 * <pre>
 *    <Controls.list:View on:selectedKeysChanged="onSelectedKeysChanged()" selectedKeys="{{ _selectedKeys }}" />
 *    <h1>{{ _message }}</h1>
 * </pre>
 * JS:
 * <pre>
 *     _beforeMount: function() {
 *       this._selectedKeys = [1, 2, 3];
 *    },
 *    onSelectedKeysChanged: function(e, keys, added, deleted) {
 *       this._selectedKeys = keys; //We don't use binding in this example so we have to update state manually.
 *       if (keys.length > 0) {
 *          this._message = 'Selected ' + keys.length + ' items.';
 *       } else {
 *          this._message = 'You have not selected any items.';
 *       }
 *    }
 * </pre>
 * @see Controls/_interface/ISource#keyProperty
 * @see selectedKeys
 */

