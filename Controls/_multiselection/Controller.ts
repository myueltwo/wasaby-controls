import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import { ISelectionObject as ISelection } from 'Controls/interface';
import { Model } from 'Types/entity';
import { CollectionItem } from 'Controls/display';
import { default as ISelectionStrategy } from './SelectionStrategy/ISelectionStrategy';
import {
   ISelectionControllerOptions,
   ISelectionControllerResult,
   ISelectionDifference,
   ISelectionItem,
   ISelectionModel,
   TKeys
} from './interface';
import clone = require('Core/core-clone');
import { CrudEntityKey } from 'Types/source';

/**
 * Контроллер множественного выбора
 * @class Controls/_multiselection/Controller
 * @author Панихин К.А.
 * @public
 */
export class Controller {
   private _model: ISelectionModel;
   private _selectedKeys: TKeys = [];
   private _excludedKeys: TKeys = [];
   private _strategy: ISelectionStrategy;
   private _limit: number|undefined;
   private _searchValue: string;

   private get _selection(): ISelection {
      return {
         selected: this._selectedKeys,
         excluded: this._excludedKeys
      };
   }
   private set _selection(selection: ISelection): void {
      this._selectedKeys = selection.selected;
      this._excludedKeys = selection.excluded;
   }

   constructor(options: ISelectionControllerOptions) {
      this._model = options.model;
      this._selectedKeys = options.selectedKeys.slice();
      this._excludedKeys = options.excludedKeys.slice();
      this._strategy = options.strategy;
      this._searchValue = options.searchValue;

      this._updateModel(this._selection);
   }

   /**
    * Обновляет состояние контроллера
    * @param {ISelectionControllerOptions} options Новые опции
    * @void
    */
   update(options: ISelectionControllerOptions): void {
      this._strategy.update(options.strategyOptions);
      this._selectedKeys = options.selectedKeys.slice();
      this._excludedKeys = options.excludedKeys.slice();
      this._model = options.model;
      this._searchValue = options.searchValue;
   }

   /**
    * Установливает ограничение на количество единоразово выбранных записей
    * @param {number} limit Ограничение
    * @void
    * @public
    */
   setLimit(limit: number|undefined): void {
      this._limit = limit;
   }

   /**
    * Возвращает результат работы после конструктора
    * @return {ISelectionControllerResult} Результат
    */
   getResultAfterConstructor(): ISelectionControllerResult {
      return this._getResult(this._selection, this._selection);
   }

   /**
    * Очищает список выбранных элементов
    * @return {ISelectionControllerResult} Результат
    */
   clearSelection(): ISelectionControllerResult {
      const oldSelection = clone(this._selection);
      this._clearSelection();
      return this._getResult(oldSelection, this._selection);
   }

   /**
    * Проставляет выбранные элементы в модели
    * @remark Не уведомляет о изменениях в модели
    * @void
    */
   restoreSelection(): void {
      // На этот момент еще может не сработать update, поэтому нужно обновить items в стратегии
      this._strategy.setItems(this._model.getCollection());
      this._updateModel(this._selection, true);
   }

   /**
    * Проставляет выбранные элементы в модели
    * @return {ISelectionControllerResult}
    */
   setSelectedKeys(selectedKeys: CrudEntityKey[], excludedKeys: CrudEntityKey[]): ISelectionControllerResult {
      const selection = {
         selected: selectedKeys,
         excluded: excludedKeys
      };
      this._updateModel(selection);
      return this._getResult(selection, selection);
   }

   /**
    * Проверяет, что были выбраны все записи.
    * @param {boolean} [byEveryItem = true] true - проверять выбранность каждого элемента по отдельности.
    *  false - проверка происходит по наличию единого признака выбранности всех элементов.
    * @return {ISelectionControllerResult}
    */
   isAllSelected(byEveryItem: boolean = true): boolean {
      return this._strategy.isAllSelected(
         this._selection,
         this._model.getHasMoreData(),
         this._model.getCount(),
         byEveryItem
      );
   }

   /**
    * Переключает состояние выбранности элемента
    * @param {CrudEntityKey} key Ключ элемента
    * @return {ISelectionControllerResult}
    */
   toggleItem(key: CrudEntityKey): ISelectionControllerResult {
      const status = this._getItemStatus(key);
      let newSelection;

      if (status === true || status === null) {
         newSelection = this._strategy.unselect(this._selection, [key]);
      } else {
         if (this._limit && !this._excludedKeys.includes(key)) {
            this._increaseLimit([key]);
         }

         newSelection = this._strategy.select(this._selection, [key]);
      }

      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;
   }

   /**
    * Выбирает все элементы
    * @return {ISelectionControllerResult}
    */
   selectAll(): ISelectionControllerResult {
      const newSelection = this._strategy.selectAll(this._selection);
      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;
   }

   /**
    * Переключает состояние выбранности у всех элементов
    * @return {ISelectionControllerResult}
    */
   toggleAll(): ISelectionControllerResult {
      const newSelection = this._strategy.toggleAll(this._selection, this._model.getHasMoreData());

      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;
   }

   /**
    * Снимает выбор со всех элементов
    * @return {ISelectionControllerResult}
    */
   unselectAll(): ISelectionControllerResult {
      const newSelection = this._strategy.unselectAll(this._selection);

      const result = this._getResult(this._selection, newSelection);
      this._selection = newSelection;
      return result;
   }

   /**
    * Обрабатываем удаление элементов из коллекции
    * @param {Array<CollectionItem<Model>>} removedItems Удаленные элементы
    * @return {ISelectionControllerResult}
    */
   handleRemoveItems(removedItems: Array<CollectionItem<Model>>): ISelectionControllerResult {
      const oldSelection = clone(this._selection);
      this._remove(this._getItemsKeys(removedItems));
      return this._getResult(oldSelection, this._selection);
   }

   /**
    * Обрабатывает сброс элементов в список
    * @return {ISelectionControllerResult}
    */
   handleResetItems(): ISelectionControllerResult {
      this._updateModel(this._selection);
      return this._getResult(this._selection, this._selection);
   }

   /**
    * Обрабатывает добавление новых элементов в коллекцию
    * @param {Array<CollectionItem<Model>>} addedItems Новые элементы
    * @return {ISelectionControllerResult}
    */
   handleAddItems(addedItems: Array<CollectionItem<Model>>): ISelectionControllerResult {
      const records = addedItems
          .filter((item) => !item['[Controls/_display/GroupItem]']) // TODO заменить на проверку SelectableItem
          .map((item) => {
             const contents = item.getContents();
             // TODO getContents() должен возвращать Record
             //  https://online.sbis.ru/opendoc.html?guid=acd18e5d-3250-4e5d-87ba-96b937d8df13
             return contents instanceof Array ? contents[contents.length - 1] : contents;
          });
      this._updateModel(this._selection, false, records);
      return this._getResult(this._selection, this._selection);
   }

   // region rightSwipe

   /**
    * Устанавливает текущее состояние анимации записи в false
    * @void
    */
   stopItemAnimation(): void {
      this._setAnimatedItem(null);
   }

   /**
    * Получает текущий анимированный элемент.
    * @void
    */
   getAnimatedItem(): ISelectionItem {
      return this._model.find((item) => !!item.isAnimatedForSelection && item.isAnimatedForSelection());
   }

   /**
    * Активирует анимацию записи
    * @param itemKey
    * @void
    */
   startItemAnimation(itemKey: CrudEntityKey): void {
      this._setAnimatedItem(itemKey);
   }

   /**
    * Устанавливает текущее состояние анимации записи по её ключу
    * @param key
    * @private
    */
   private _setAnimatedItem(key: CrudEntityKey): void {
      const oldSwipeItem = this.getAnimatedItem();
      const newSwipeItem = this._model.getItemBySourceKey(key);

      if (oldSwipeItem) {
         oldSwipeItem.setAnimatedForSelection(false);
      }
      if (newSwipeItem) {
         newSwipeItem.setAnimatedForSelection(true);
      }
   }

   // endregion

   private _clearSelection(): void {
      this._selectedKeys = [];
      this._excludedKeys = [];
   }

   private _remove(keys: TKeys): void {
      this._excludedKeys = ArraySimpleValuesUtil.removeSubArray(this._excludedKeys.slice(), keys);
      this._selectedKeys = ArraySimpleValuesUtil.removeSubArray(this._selectedKeys.slice(), keys);
   }

   private _getItemStatus(key: CrudEntityKey): boolean {
      return this._model.getItemBySourceKey(key).isSelected();
   }

   private _getCount(selection?: ISelection): number | null {
      return this._strategy.getCount(selection || this._selection, this._model.getHasMoreData(), this._limit);
   }

   private _getItemsKeys(items: Array<CollectionItem<Model>|Model>): TKeys {
      return items.map((item) => item instanceof CollectionItem ? item.getContents().getKey() : item.getKey());
   }

   private _getResult(oldSelection: ISelection, newSelection: ISelection): ISelectionControllerResult {
      const
         selectionCount = this._getCount(newSelection),
         oldSelectedKeys = oldSelection.selected,
         oldExcludedKeys = oldSelection.excluded,
         // selectionCount будет равен нулю, если в списке не отмечено ни одного элемента
         // или после выделения всех записей через "отметить всё", пользователь руками снял чекбоксы со всех записей
         newSelectedKeys = selectionCount === 0 ? [] : newSelection.selected,
         newExcludedKeys = selectionCount === 0 ? [] : newSelection.excluded,
         selectedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldSelectedKeys, newSelectedKeys),
         excludedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldExcludedKeys, newExcludedKeys);

      const selectedDifference: ISelectionDifference = {
         keys: newSelectedKeys,
         added: selectedKeysDiff.added,
         removed: selectedKeysDiff.removed
      };

      const excludedDifference: ISelectionDifference = {
         keys: newExcludedKeys,
         added: excludedKeysDiff.added,
         removed: excludedKeysDiff.removed
      };

      return {
         selectedKeysDiff: selectedDifference,
         excludedKeysDiff: excludedDifference,
         selectedCount: selectionCount,
         isAllSelected: this._strategy.isAllSelected(newSelection, this._model.getHasMoreData(), this._model.getCount())
      };
   }

   /**
    * Увеличивает лимит на количество выбранных записей, все предыдущие невыбранные записи при этом попадают в исключение
    * @param {Array} keys
    * @private
    */
   private _increaseLimit(keys: TKeys): void {
      let selectedItemsCount: number = 0;
      const limit: number = this._limit ? this._limit - this._excludedKeys.length : 0;

      this._model.getCollection().forEach((item) => {
         const key: CrudEntityKey = item.getKey();

         const selectionForModel = this._strategy.getSelectionForModel(this._selection, this._limit);

         let itemStatus = false;
         if (selectionForModel.get(true).filter((selectedItem) => selectedItem.getKey() === key).length > 0) {
            itemStatus = true;
         }

         if (selectedItemsCount < limit && itemStatus !== false) {
            selectedItemsCount++;
         } else if (selectedItemsCount >= limit && keys.length) {
            selectedItemsCount++;
            this._limit++;

            if (keys.includes(key)) {
               keys.splice(keys.indexOf(key), 1);
            } else {
               this._excludedKeys.push(key);
            }
         }
      });
   }

   private _updateModel(selection: ISelection, silent: boolean = false, items?: Model[]): void {
      const selectionForModel = this._strategy.getSelectionForModel(selection, this._limit, items, this._searchValue);
      // TODO думаю лучше будет занотифаить об изменении один раз после всех вызовов (сейчас нотифай в каждом)
      this._model.setSelectedItems(selectionForModel.get(true), true, silent);
      this._model.setSelectedItems(selectionForModel.get(false), false, silent);
      this._model.setSelectedItems(selectionForModel.get(null), null, silent);
   }
}
