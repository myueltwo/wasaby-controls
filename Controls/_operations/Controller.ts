import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_operations/Controller/Controller');
import tmplNotify = require('Controls/Utils/tmplNotify');
import { SyntheticEvent } from 'Vdom/Vdom';
import { TKeySelection as TKey } from 'Controls/interface';
import {default as OperationsController} from 'Controls/_operations/ControllerClass';

/** 
 * Контрол используется для организации множественного выбора. 
 * Он обеспечивает связь между Controls/operationsPanel:Containter и {@link Controls/list:Containter}.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 * @class Controls/_operations/Controller
 * @extends Core/Control
 * @mixes Controls/interface/IPromisedSelectable
 * @control
 * @author Авраменко А.С.
 * @public
 */

/*
 * Container for content that can work with multiselection.
 * Puts selection in child context.
 * The detailed description and instructions on how to configure the control you can read <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 *
 * @class Controls/_operations/Controller
 * @extends Core/Control
 * @mixes Controls/interface/IPromisedSelectable
 * @control
 * @author Авраменко А.С.
 * @public
 */

export default class MultiSelector extends Control {
   protected _template: TemplateFunction = template;
   protected _selectedKeysCount: number|null;
   protected _isAllSelected: boolean = false;
   protected _listMarkedKey: TKey = null;
   protected _notifyHandler: Function = tmplNotify;
   private _operationsController: OperationsController = null;

   protected _beforeMount(options): void {
      this._itemOpenHandler = this._itemOpenHandler.bind(this);
      this._operationsController = this._createOperationsController(options);
   }

   protected _beforeUpdate(options): void {
      this._operationsController.update(options);
   }

   protected _beforeUnmount(): void {
      if (this._operationsController) {
         this._operationsController.destroy();
         this._operationsController = null;
      }
   }

   protected _registerHandler(event, registerType, component, callback, config): void {
      this._getOperationsController().registerHandler(event, registerType, component, callback, config);
   }

   protected _unregisterHandler(event, registerType, component, config): void {
      this._getOperationsController().unregisterHandler(event, component, config);
   }

   protected _selectedTypeChangedHandler(event: SyntheticEvent<null>, typeName: string): void {
      this._getOperationsController().selectionTypeChanged(typeName);
   }

   protected _selectedKeysCountChanged(e, count: number|null, isAllSelected: boolean): void {
      e.stopPropagation();
      this._selectedKeysCount = count;
      this._isAllSelected = isAllSelected;
   }

   protected _itemOpenHandler(newCurrentRoot, items, dataRoot = null): void {
      return this._getOperationsController().itemOpenHandler(newCurrentRoot, items, dataRoot);
   }

   protected _listMarkedKeyChangedHandler(event: SyntheticEvent<null>, markedKey: Key): void {
      this._listMarkedKey = this._getOperationsController(this._options).setListMarkedKey(markedKey);
      this._notify('markedKeyChanged', [markedKey]);
   }

   protected _markedKeyChangedHandler(event: SyntheticEvent<null>): void {
      event.stopPropagation();
   }

   protected _operationsPanelOpen(): void {
      this._listMarkedKey = this._getOperationsController(this._options).setOperationsPanelVisible(true);
   }

   protected _operationsPanelClose(): void {
      this._getOperationsController(this._options).setOperationsPanelVisible(false);
   }

   private _createOperationsController(options) {
      const controllerOptions = {
         ...options,
         ...{
            selectionViewModeChangedCallback: (type) => {
               this._notify('selectionViewModeChanged', [type]);
            }
         }
      };
      return new OperationsController(controllerOptions);
   }

   private _getOperationsController(): OperationsController {
      if (!this._operationsController) {
         this._operationsController = this._createOperationsController(this._options);
      }

      return this._operationsController;
   }
}
