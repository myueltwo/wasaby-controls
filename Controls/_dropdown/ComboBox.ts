import rk = require('i18n!Controls');
import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_dropdown/ComboBox/ComboBox');
import * as Utils from 'Types/util';
import {prepareEmpty, loadItems} from 'Controls/_dropdown/Util';
import {tmplNotify} from 'Controls/eventUtils';
import Controller from 'Controls/_dropdown/_Controller';
import {BaseDropdown, DropdownReceivedState} from 'Controls/_dropdown/BaseDropdown';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ISingleSelectableOptions, IBorderStyleOptions, IValidationStatusOptions} from 'Controls/interface';
import {IBaseDropdownOptions} from 'Controls/_dropdown/interface/IBaseDropdown';
import getDropdownControllerOptions from 'Controls/_dropdown/Utils/GetDropdownControllerOptions';
import {IStickyPopupOptions} from 'Controls/popup';
import * as Merge from 'Core/core-merge';
import {isLeftMouseButton} from 'Controls/fastOpenUtils';
import {generateStates} from 'Controls/input';

interface IComboboxOptions extends IBaseDropdownOptions, ISingleSelectableOptions, IBorderStyleOptions,
    IValidationStatusOptions {
   placeholder?: string;
   value?: string;
}

const getPropValue = Utils.object.getPropertyValue.bind(Utils);

/**
 * Контрол, позволяющий выбрать значение из списка. Полный список параметров отображается при нажатии на контрол.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FCombobox%2FComboboxVDom">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/dropdown-menu/combobox/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdown.less">переменные тем оформления dropdown</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_dropdownPopup.less">переменные тем оформления dropdownPopup</a>
 *
 * @class Controls/_dropdown/ComboBox
 * @extends Core/Control
 * @implements Controls/_interface/ISource
 * @implements Controls/_menu/interface/IMenuBase
 * @implements Controls/_interface/IFilterChanged
 * @implements Controls/_interface/ISingleSelectable
 * @implements Controls/interface/IInputPlaceholder
 * @implements Controls/_input/interface/ITag
 * @implements Controls/_interface/IValidationStatus
 * @implements Controls/_interface/IFontSize
 * @implements Controls/_interface/IFontColorStyle
 * @implements Controls/_interface/ITooltip
 * @implements Controls/_interface/IHeight
 * @implements Controls/interface/IDropdown
 * @control
 * @public
 * @category Input
 * @author Золотова Э.Е.
 * @demo Controls-demo/dropdown_new/Combobox/Source/Index
 */

/*
 * Control that shows list of options. In the default state, the list is collapsed, showing only one choice.
 * The full list of options is displayed when you click on the control.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FCombobox%2FComboboxVDom">Demo-example</a>.
 * @class Controls/_dropdown/ComboBox
 * @extends Core/Control
 * @implements Controls/_interface/ISource
 * @implements Controls/interface/IItemTemplate
 * @implements Controls/_interface/IFilterChanged
 * @implements Controls/_interface/ISingleSelectable
 * @implements Controls/interface/IDropdownEmptyText
 * @implements Controls/_input/interface/IBase
 * @implements Controls/interface/IDropdown
 * @control
 * @public
 * @category Input
 * @author Золотова Э.Е.
 * @demo Controls-demo/Input/ComboBox/ComboBoxPG
 */

/**
 * @event Controls/_dropdown/ComboBox#valueChanged Происходит при изменении отображаемого значения контрола.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} value Отображаемое значение контрола.
 * @remark
 * Событие используется в качестве реакции на изменения, вносимые пользователем.
 * @example
 * WML:
 * <pre>
 *     <Controls.dropdown:ComboBox
 *                on:valueChanged="_valueChangedHandler()"
 *                source="{{_source}}"/>
 * </pre>
 * TS:
 *    private _valueChangedHandler(event, value) {
 *        this._text = value;
 *    }
 */

class ComboBox extends BaseDropdown {
   protected _template: TemplateFunction = template;
   protected _notifyHandler: Function = tmplNotify;
   protected _borderStyle: string = '';

   _beforeMount(options: IComboboxOptions,
                context: object,
                receivedState: DropdownReceivedState): void | Promise<DropdownReceivedState> {
      this._placeholder = options.placeholder;
      this._value = options.value;
      this._setText = this._setText.bind(this);
      this._targetPoint = {
         vertical: 'bottom'
      };

      generateStates(this, options);
      this._controller = new Controller(this._getControllerOptions(options));
      this._borderStyle = this._getBorderStyle(options.borderStyle, options.validationStatus);
      return loadItems(this._controller, receivedState, options.source);
   }

   protected _beforeUpdate(newOptions: IComboboxOptions): void {
      this._controller.update(this._getControllerOptions(newOptions));
      this._borderStyle = this._getBorderStyle(newOptions.borderStyle, newOptions.validationStatus);
   }

   _getControllerOptions(options: IComboboxOptions): object {
      const controllerOptions = getDropdownControllerOptions(options);
      return { ...controllerOptions, ...{
            selectedKeys: [options.selectedKey],
            markerVisibility: 'hidden',
            dataLoadCallback: options.dataLoadCallback,
            popupClassName: (options.popupClassName ? options.popupClassName + ' controls-ComboBox-popup' : 'controls-ComboBox-popup')
                           + ' controls-ComboBox-popup_theme-' + options.theme,
            typeShadow: 'suggestionsContainer',
            close: this._onClose,
            open: this._onOpen,
            allowPin: false,
            selectedItemsChangedCallback: this._setText,
            theme: options.theme,
            itemPadding: {
               right: 'menu-xs',
               left: 'menu-xs'
            },
            targetPoint: this._targetPoint,
            openerControl: this
         }
      };
   }

   _getMenuPopupConfig(): IStickyPopupOptions {
      return {
         templateOptions: {
            width: this._getContainerNode(this._container).offsetWidth
         },
         eventHandlers: {
            onOpen: this._onOpen.bind(this),
            onClose: this._onClose.bind(this),
            onResult: this._onResult.bind(this)
         }
      };
   }

   _selectedItemsChangedHandler(selectedItems): void {
      const key = getPropValue(selectedItems[0], this._options.keyProperty);
      this._setText(selectedItems);
      this._notify('valueChanged', [this._value]);
      this._notify('selectedKeyChanged', [key]);
   }

   _setText(selectedItems): void {
      this._isEmptyItem = getPropValue(selectedItems[0], this._options.keyProperty) === null || selectedItems[0] === null;
      if (this._isEmptyItem) {
         this._value = '';
         this._placeholder = prepareEmpty(this._options.emptyText);
      } else {
         this._value = String(getPropValue(selectedItems[0], this._options.displayProperty) || '');
         this._placeholder = this._options.placeholder;
      }
   }

   _handleMouseDown(event: SyntheticEvent<MouseEvent>): void {
      if (!isLeftMouseButton(event)) {
         return;
      }
      if (this._isOpened) {
         this._controller.closeMenu();
      } else {
         this.openMenu();
      }
   }

   openMenu(popupOptions?: IStickyPopupOptions): void {
      const config = this._getMenuPopupConfig();
      this._controller.setMenuPopupTarget(this._container);

      this._controller.openMenu(Merge(config, popupOptions || {})).then((result) => {
         if (result) {
            this._selectedItemsChangedHandler(result);
         }
      });
   }

   protected _onResult(action: string, data): void {
      if (action === 'itemClick') {
         const item = this._controller.getPreparedItem(data);
         this._selectedItemsChangedHandler([item]);
         this._controller.handleSelectedItems(item);
      }
   }

   protected _deactivated(event: SyntheticEvent<Event>): void {
      // если фокус ушел в меню, не закрываем его
      // TODO https://online.sbis.ru/opendoc.html?guid=b34ba2ef-fec0-42df-87d8-77541ec82c34
      if (!event.nativeEvent.relatedTarget?.closest('.controls-Menu__popup')) {
         this.closeMenu();
      }
   }

   //FIXME delete after https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
   private _getContainerNode(container:[HTMLElement]|HTMLElement): HTMLElement {
      return container[0] || container;
   }

   private _getBorderStyle(borderStyle: string, validationStatus: string): string {
      if (borderStyle && validationStatus === 'valid') {
         return  borderStyle;
      }
      return validationStatus;
   }

   static _theme: string[] = ['Controls/dropdown', 'Controls/Classes'];

   static getDefaultOptions(): object {
      return {
         placeholder: rk('Выберите') + '...',
         validationStatus: 'valid',
         textAlign: 'left',
         inlineHeight: 'default',
         fontSize: 'm',
         fontColorStyle: 'default',
         tooltip: ''
      };
   }
}

export = ComboBox;
