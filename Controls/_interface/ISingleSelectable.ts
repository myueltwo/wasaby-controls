export interface ISingleSelectableOptions {
   selectedKey?: number | string;
   keyProperty: string;
}
/**
 * Interface for item selection in lists where only one item can be selected at a time.
 *
 * @interface Controls/_interface/ISingleSelectable
 * @public
 * @author Авраменко А.С.
 * @see Controls/_interface/IMultiSelectable
 * @see Controls/interface/IPromisedSelectable
 */
export default interface ISingleSelectable {
   readonly '[Controls/_interface/ISingleSelectable]': boolean;
}
/**
 * @name Controls/_interface/ISingleSelectable#selectedKey
 * @cfg {Number|String} Selected item key.
 * @default Undefined
 * @example
 * The following example creates RadioGroup and selects first item. Subsequent changes made to selectedKey will be synchronized through binding mechanism.
 * <pre>
 *    <Controls.toggle:RadioGroup bind:selectedKey="_selectedKey"/>
 * </pre>
 * <pre>
 *    _beforeMount: function() {
    *       this._SelectedKey = '1';
    *    }
 * </pre>
 * @see selectedKeyChanged
 * @see keyProperty
 */

/**
 * @event Controls/_interface/ISingleSelectable#selectedKeyChanged Occurs when selection was changed.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Number|String} key Selected item key.
 * @example
 * The following example creates RadioGroup with empty selection. Subsequent changes made to selectedKey will be synchronized through binding mechanism. Source of the operations panel will be updated every time selectedKey change.
 * <pre>
 *    <Controls.Container.RadioGroup on:selectedKeyChanged="onSelectedKeyChanged()" bind:selectedKey="_selectedKey">
 *       <Controls.operations:Panel source="{{ _panelSource }} />
 *    </Controls.Container.RadioGroup>
 * </pre>
 * <pre>
 *    _beforeMount: function() {
    *       this._selectedKey = undefined;
    *    },
 *    onSelectedKeyChanged: function(e, selectedKey) {
    *       //Note that we simultaneously have event handler and bind for the same option, so we don't have to update state manually.
    *       this._panelSource = this._getPanelSource(selectedKey);
    *    }
 * </pre>
 * @see selectedKey
 */
