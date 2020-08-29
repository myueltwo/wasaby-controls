import { IDragPosition, TKey, TPosition } from './interface';
import { SyntheticEvent } from 'Vdom/Vdom';
import { ItemsEntity } from 'Controls/dragnDrop';
import { CollectionItem } from 'Controls/display';
import { Model } from 'Types/entity';
import { ISelectionObject } from 'Controls/interface';

export interface IModel {
   setDraggedItems(draggedItem: TKey, draggedItems: Array<string | number>): void;
   setDragPosition(position: IDragPosition<CollectionItem<Model>>): void;
   resetDraggedItems(): void;

   getItemBySourceKey(key: TKey): CollectionItem<Model>;

   getIndexByKey(key: TKey): number;
   getIndex(item: CollectionItem<Model>): number;
}

export default class FlatController {
   protected _draggableItem: CollectionItem<Model>;
   protected _model: IModel;
   private _dragPosition: IDragPosition<CollectionItem<Model>>;
   private _entity: ItemsEntity;
   private _startIndex: number;

   constructor(model: IModel) {
      this._model = model;
   }

   update(model: IModel): void {
      this._model = model;
   }

   startDrag(draggedKey: TKey, entity: ItemsEntity): void {
      const draggedItem = this._model.getItemBySourceKey(draggedKey);
      this.setDraggedItems(entity, draggedItem);
   }

   setDraggedItems(entity: ItemsEntity, draggedItem: CollectionItem<Model> = null): void {
      this._entity = entity;

      this._draggableItem = draggedItem;
      this._startIndex = this._getIndex(draggedItem);
      this._model.setDraggedItems(this._draggableItem.getContents().getKey(), entity.getItems());
   }

   setDragPosition(position: IDragPosition<CollectionItem<Model>>): void {
      if (this._dragPosition === position) {
         return;
      }

      this._dragPosition = position;
      this._model.setDragPosition(position);
   }

   endDrag(): void {
      this._draggableItem = null;
      this._dragPosition = null;
      this._entity = null;
      this._model.resetDraggedItems();
   }

   isDragging(): boolean {
      return !!this._entity;
   }

   getDragPosition(): IDragPosition<CollectionItem<Model>> {
      return this._dragPosition;
   }

   getDragEntity(): ItemsEntity {
      return this._entity;
   }

   calculateDragPosition(targetItem: CollectionItem<Model>, position?: TPosition): IDragPosition<CollectionItem<Model>> {
      let prevIndex = -1;

      // If you hover on a record that is being dragged, then the position should not change.
      if (this._draggableItem.getContents().getKey() === targetItem.getContents().getKey()) {
         return this._dragPosition;
      }

      if (this._dragPosition) {
         prevIndex = this._dragPosition.index;
      } else if (this._draggableItem) {
         prevIndex = this._startIndex;
      }

      const targetIndex = this._getIndex(targetItem);
      if (prevIndex === -1) {
         position = 'before';
      } else if (targetIndex > prevIndex) {
         position = 'after';
      } else if (targetIndex < prevIndex) {
         position = 'before';
      } else if (targetIndex === prevIndex) {
         position = this._dragPosition.position === 'after' ? 'before' : 'after';
      }

      return {
         index: targetIndex,
         dispItem: targetItem,
         position
      };
   }

   protected _getIndex(item: CollectionItem<Model>): number {
      return this._model.getIndex(item);
   }

   static canStartDragNDrop(
       canStartDragNDropOption: boolean|Function,
       event: SyntheticEvent<MouseEvent>,
       isTouch: boolean
   ): boolean {
      return (!canStartDragNDropOption || typeof canStartDragNDropOption === 'function' && canStartDragNDropOption())
         && !event.nativeEvent.button && !event.target.closest('.controls-DragNDrop__notDraggable') && !isTouch;
   }

   /**
    * Возвращает выбранные элементы, где
    * в выбранные добавлен элемент, за который начали drag-n-drop, если он отсутствовал,
    * выбранные элементы отсортированы по порядку их следования в модели(по индексам перед началом drag-n-drop),
    * из исключенных элементов удален элемент, за который начали drag-n-drop, если он присутствовал
    *
    * @param model
    * @param selection
    * @param dragKey
    */
   static getSelectionForDragNDrop(model: IModel, selection: ISelectionObject, dragKey: TKey): ISelectionObject {
      const allSelected = selection.selected.indexOf(null) !== -1;

      const selected = [...selection.selected];
      if (selected.indexOf(dragKey) === -1 && !allSelected) {
         selected.push(dragKey);
      }

      // TODO по идее элементы должны быть уже упорядочены в multiselection
      //  https://online.sbis.ru/opendoc.html?guid=4a6d3f0f-6eb9-4d35-85ae-683922a57f98
      // Тогда если перетаскиваемый элемент не выбран,
      // то его нужно будет вставить на "свое" место, исходя из его индекса в списке
      this._sortKeys(model, selected);

      const excluded = [...selection.excluded];
      const dragItemIndex = excluded.indexOf(dragKey);
      if (dragItemIndex !== -1) {
         excluded.splice(dragItemIndex, 1);
      }

      return {
         selected,
         excluded,
         recursive: false
      };
   }

   /**
    * Сортировать список ключей элементов
    * Ключи сортируются по порядку, в котором они идут в списке
    * @param model
    * @param keys
    * @private
    */
   private static _sortKeys(model: IModel, keys: Array<number|string>): void {
      keys.sort((a, b) => {
         const indexA = model.getIndexByKey(a),
               indexB = model.getIndexByKey(b);
         return indexA > indexB ? 1 : -1;
      });
   }
}
