/**
 * Интерфейс контролов, которые могут поставлять текстовое значение.
 *
 * @interface Controls/_interface/ITextValue
 * @public
 * @author Герасимов А.М.
 */
export default interface ITextValue {
    readonly '[Controls/_interface/ITextValue]': boolean;
}
/**
 * @event Controls/_interface/ITextValue#textValueChanged Происходит при изменении набора выбранной коллекции.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Декскриптор события.
 * @param {String} textValue Строка, сформированная из выбранных записей.
 *
 * @example
 * В следующем примере создается Controls/lookup:Selector и демонстрируется сценарий использования.
 * WML:
 * <pre>
 *    <Controls.lookup:Selector
 *       source="{{_source}}"
 *       keyProperty="id"
 *       on:textValueChanged="onTextValueChanged()">
 *    </Controls.lookup:Selector>
 * </pre>
 * JS:
 * <pre>
 *    onTextValueChanged: function(e, textValue) {
 *       UserConfig.setParam('selectedItems', textValue);
 *    }
 * </pre>
 */
/*
 * @event Controls/_interface/ITextValue#textValueChanged Occurs when changing the set of the selected collection.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {String} textValue String formed from selected entries.
 *
 * @example
 * The following example creates Controls/lookup:Selector and shows how to handle the event.
 * WML:
 * <pre>
 *    <Controls.lookup:Selector
 *       source="{{_source}}"
 *       keyProperty="id"
 *       on:textValueChanged="onTextValueChanged()">
 *    </Controls.lookup:Selector>
 * </pre>
 * JS:
 * <pre>
 *    onTextValueChanged: function(e, textValue) {
 *       UserConfig.setParam('selectedItems', textValue);
 *    }
 * </pre>
 */