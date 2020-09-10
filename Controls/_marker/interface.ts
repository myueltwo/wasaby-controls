import { CollectionItem, IBaseCollection } from 'Controls/display';
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';

export type TVisibility = 'visible' | 'hidden' | 'onactivated';
export enum Visibility { Visible = 'visible', Hidden = 'hidden', OnActivated = 'onactivated'}
export type TKey = string|number;

export interface IMarkerModel extends IBaseCollection<Model, CollectionItem<Model>> {
   setMarkedKey(key: TKey, status: boolean): void;
   getMarkedKey(): TKey;
   getFirstItem(): Model;
   getCount(): number;
   getValidItemForMarker(index: number): CollectionItem<Model>;
   getStartIndex(): number;
   getStopIndex(): number;

   getNextByKey(key: TKey): CollectionItem<Model>;
   getPrevByKey(key: TKey): CollectionItem<Model>;

   getNextByIndex(index: number): CollectionItem<Model>;
   getPrevByIndex(index: number): CollectionItem<Model>;

   getItemBySourceKey(key: TKey): CollectionItem<Model>;

   getIndexBySourceIndex(sourceIndex: number): number;

   getCollection(): RecordSet;

   getIndex(item: CollectionItem<Model>): number;
}

export interface IOptions {
   model: IMarkerModel;
   markerVisibility: TVisibility;
   markedKey?: TKey;
}
