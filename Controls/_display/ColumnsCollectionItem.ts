import CollectionItem, {IOptions as IBaseOptions} from './CollectionItem';
import {ColumnsCollection} from '../display';

export interface IOptions<T> extends IBaseOptions<T> {
    columnProperty: number;
    column: number;
}

export default class ColumnsCollectionItem<T> extends CollectionItem<T> {
    protected _$columnProperty: string;
    protected _$column: number = 0;
    protected _$owner: ColumnsCollection<T>;

    constructor(options?: IOptions<T>) {
        super(options);
        this._$column = options?.column || 0;
    }

    getColumn(): number {
        return this._$column;
    }
    setColumn(column: number): void {
        if (this._$column === column) {
            return;
        }
        this._$column = column;
        this._nextVersion();
    }

    get index(): number {
        return this.getOwner().getIndex(this);
    }

    getWrapperClasses(templateHighlightOnHover: boolean = true, theme?: 'string', cursor: string|boolean = 'pointer'): string {
        let result: string = super.getWrapperClasses.apply(this, arguments);
        result += ' controls-ColumnsView__itemV';
        if (cursor === true || cursor === 'pointer') {
            result += ' controls-ListView__itemV_cursor-pointer';
        }
        return result;
    }

    getContentClasses(): string {
        // Тут должен быть вызов метода суперкласса, НО нам не нужны почти все классы, которые он предлагает
        return ' controls-ColumnsView__itemContent';
    }

    getItemActionClasses(itemActionsPosition: string, theme?: string): string {
        return `controls-ColumnsView__itemActionsV_${itemActionsPosition}_theme-${theme}`;
    }
}

Object.assign(ColumnsCollectionItem.prototype, {
    '[Controls/_display/ColumnsCollectionItem]': true,
    _moduleName: 'Controls/display:ColumnsCollectionItem',
    _instancePrefix: 'columns-item-',
    _$column: 1
});
