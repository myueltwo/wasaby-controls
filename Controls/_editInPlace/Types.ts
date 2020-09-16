import {Model} from 'Types/entity';
import {CollectionItem} from 'Controls/display';
import {editing as GLOBAL_EDITING_CONSTANTS} from 'Controls/Constants';

/**
 * @typedef {String} CONSTANTS
 * @description Набор констант, использующихся в редактировании по месту.
 * @variant CANCEL позволяет отменить асинхронную операцию, вернув значение из функции обратного вызова до начала операции.
 */
export const CONSTANTS  = {
    CANCEL: GLOBAL_EDITING_CONSTANTS.CANCEL
};

/**
 * @typedef {CollectionItem.<Types/entity:Model>>} TEditableCollectionItem
 * @description Тип элемента редактируео коллекции.
 */
export type TEditableCollectionItem<S extends Model = Model> = CollectionItem<S>;

/**
 * @typedef {String|Number|Null} TKey
 * @description Тип ключа редактируемого элемента.
 */
export type TKey = string | number | null;

/**
 * @typedef {String} TAddPosition
 * @description Позиция в коллекции добавляемого элемента. Позиция определяется относительно определенного набора данных.
 * Если элемент добавляется в группу, то набором будут все элементы группы.
 * Если элемент добавляется в родителя, то набором будут все дочерние элементы родителя.
 * Если элемент добавляется в корень, то набором будут все элементы коллекции.
 * @variant top Добавить элемент в начало набора данных.
 * @variant bottom  Добавить элемент в конец набора данных.
 */
export type TAddPosition = 'top' | 'bottom';
