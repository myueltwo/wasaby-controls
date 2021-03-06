import {ICrud, ICrudPlus, IData, PrefetchProxy} from 'Types/source';
import {CrudWrapper} from './CrudWrapper';
import {NavigationController} from 'Controls/source';
import {INavigationOptionValue,
        INavigationSourceConfig,
        Direction,
        TKey,
        IBaseSourceConfig,
        IFilterOptions,
        ISortingOptions,
        IHierarchyOptions,
        IGroupingOptions,
        ISourceOptions,
        IPromiseSelectableOptions,
        INavigationOptions} from 'Controls/interface';
import {TNavigationPagingMode} from 'Controls/_interface/INavigation';
import {RecordSet} from 'Types/collection';
import {Record as EntityRecord, CancelablePromise} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {QueryOrderSelector, QueryWhereExpression} from 'Types/source';
import {IQueryParams} from 'Controls/_interface/IQueryParams';
import {default as groupUtil} from './GroupUtil';
import {isEqual} from 'Types/object';
// @ts-ignore
import * as cInstance from 'Core/core-instance';
import {TArrayGroupId} from 'Controls/_list/Controllers/Grouping';

export interface IControllerState {
    keyProperty: string;
    source: ICrud | ICrudPlus;

    sorting: QueryOrderSelector;
    filter: QueryWhereExpression<unknown>;
    navigation: INavigationOptionValue<INavigationSourceConfig>;
    root?: TKey;

    items: RecordSet;
    sourceController: Controller;
}

export interface IControllerOptions extends
    IFilterOptions,
    ISortingOptions,
    IHierarchyOptions,
    IGroupingOptions,
    ISourceOptions,
    IPromiseSelectableOptions,
    INavigationOptions<INavigationSourceConfig> {
    dataLoadErrback?: Function;
    root?: string;
    expandedItems?: TKey[];
    deepReload?: boolean;
    collapsedGroups?: TArrayGroupId;
}

type LoadResult = Promise<RecordSet|Error>;

enum NAVIGATION_DIRECTION_COMPATIBILITY {
    up = 'backward',
    down = 'forward'
}

export default class Controller {
    private _options: IControllerOptions;
    private _filter: QueryWhereExpression<unknown>;
    private _crudWrapper: CrudWrapper;
    private _navigationController: NavigationController;
    private _items: RecordSet;
    private _loadPromise: CancelablePromise<LoadResult>;

    private _parentProperty: string;
    private _root: TKey;

    private _expandedItems: TKey[];
    private _deepReload: boolean;

    constructor(cfg: IControllerOptions) {
        this._options = cfg;
        this._filter = cfg.filter;

        this.setRoot(cfg.root);
        this.setParentProperty(cfg.parentProperty);

        this._collectionChange = this._collectionChange.bind(this);
    }
    load(direction?: Direction,
         key: TKey = this._root,
         navigationSourceConfig?: INavigationSourceConfig
    ): Promise<LoadResult> {
        return this._load(direction, key, navigationSourceConfig);
    }

    reload(sourceConfig?: INavigationSourceConfig): LoadResult {
        this._navigationController = null;
        this._deepReload = true;

        return this._load(undefined, this._root, sourceConfig).then((result) => {
            this._deepReload = false;
            return result;
        });
    }

    read(key: TKey, meta?: object): Promise<EntityRecord> {
        return (this._options.source as ICrud).read(key, meta);
    }

    update(item: EntityRecord): Promise<void> {
        return (this._options.source as ICrud).update(item);
    }

    create(meta?: object): Promise<EntityRecord> {
        return (this._options.source as ICrud).create(meta);
    }

    setItems(items: RecordSet): RecordSet {
        this._setItems(items);

        if (this._hasNavigationBySource()) {
            this._getNavigationController(this._options.navigation).updateQueryProperties(items, this._root);
        }

        return this._items;
    }

    getItems(): RecordSet {
        return this._items;
    }

    setFilter(filter: QueryWhereExpression<unknown>): QueryWhereExpression<unknown> {
        return this._filter = filter;
    }

    getFilter(): QueryWhereExpression<unknown> {
        return this._filter;
    }

    // FIXME, если root задаётся на списке, а не на data(browser)
    setRoot(key: TKey): void {
        this._root = key;
    }

    // FIXME, если parentProperty задаётся на списке, а не на data(browser)
    setParentProperty(parentProperty: string): void {
        this._parentProperty = parentProperty;
    }

    updateOptions(newOptions: IControllerOptions): boolean {
        const isFilterChanged = !isEqual(newOptions.filter, this._options.filter);
        const isSourceChanged = newOptions.source !== this._options.source;
        const isNavigationChanged = !isEqual(newOptions.navigation, this._options.navigation);

        if (isFilterChanged) {
            this._filter = newOptions.filter;
        }

        if (newOptions.hasOwnProperty('parentProperty') && newOptions.parentProperty !== this._options.parentProperty) {
            this.setParentProperty(newOptions.parentProperty);
        }

        if (newOptions.hasOwnProperty('root') && newOptions.root !== this._options.root) {
            this.setRoot(newOptions.root);
        }

        if (newOptions.expandedItems !== this._options.expandedItems) {
            this.setExpandedItems(newOptions.expandedItems);
        }

        if (isSourceChanged && this._crudWrapper) {
            this._crudWrapper.updateOptions({source: newOptions.source as ICrud});
        }

        if (isNavigationChanged) {
            if (newOptions.navigation && this._hasNavigationBySource(newOptions.navigation)) {
                if (this._navigationController)  {
                    this._navigationController.updateOptions({
                        navigationType: newOptions.navigation.source,
                        navigationConfig: newOptions.navigation.sourceConfig
                    });
                } else {
                    this._navigationController = this._getNavigationController(newOptions.navigation);
                }
            }

        }

        const isChanged =
            isFilterChanged ||
            isNavigationChanged ||
            isSourceChanged ||
            newOptions.sorting !== this._options.sorting ||
            newOptions.keyProperty !== this._options.keyProperty ||
            newOptions.root !== this._options.root;

        this._options = newOptions;
        return isChanged;
    }

    getState(): IControllerState {
        const source = this._options.source instanceof PrefetchProxy ?
            this._options.source.getOriginal<ICrud>() :
            this._options.source;

        return {
            keyProperty: this._options.keyProperty,
            source,

            filter: this._filter,
            sorting: this._options.sorting,
            navigation: this._options.navigation,
            root: this._options.root,

            items: this._items,
            // FIXME sourceController не должен создаваться, если нет source
            // https://online.sbis.ru/opendoc.html?guid=3971c76f-3b07-49e9-be7e-b9243f3dff53
            sourceController: source ? this : null
        };
    }

    // FIXME для работы дерева без bind'a опции expandedItems
    setExpandedItems(expandedItems: TKey[]): void {
        this._expandedItems = expandedItems;
    }

    // FIXME для поддержки nodeSourceControllers в дереве
    calculateState(items: RecordSet, direction: Direction, key: TKey = this._root): void {
        this._updateQueryPropertiesByItems(items, key);
    }

    hasMoreData(direction: Direction, key: TKey = this._root): boolean {
        let hasMoreData = false;

        if (this._hasNavigationBySource()) {
            hasMoreData = this._getNavigationController(this._options.navigation)
                .hasMoreData(NAVIGATION_DIRECTION_COMPATIBILITY[direction], key);
        }

        return hasMoreData;
    }

    isLoading(): boolean {
        return !!this._loadPromise;
    }

    shiftToEdge(direction: Direction, id: TKey, shiftMode: TNavigationPagingMode): void {
        if (this._hasNavigationBySource()) {
            this._getNavigationController(this._options.navigation)
                .shiftToEdge(NAVIGATION_DIRECTION_COMPATIBILITY[direction], id, shiftMode);
        }
    }

    cancelLoading(): void {
        if (this._loadPromise) {
            this._loadPromise.cancel();
            this._loadPromise = null;
        }
    }

    destroy(): void {
        this.cancelLoading();
        this._unsubscribeItemsCollectionChangeEvent();

        if (this._navigationController) {
            this._navigationController.destroy();
            this._navigationController = null;
        }
    }

    private _getCrudWrapper(sourceOption: ICrud): CrudWrapper {
        if (!this._crudWrapper) {
            this._crudWrapper = new CrudWrapper({source: sourceOption});
        }
        return this._crudWrapper;
    }

    private _getNavigationController(
        navigationOption: INavigationOptionValue<INavigationSourceConfig>
    ): NavigationController {
        if (!this._navigationController) {
            this._navigationController = new NavigationController({
                navigationType: navigationOption.source,
                navigationConfig: navigationOption.sourceConfig
            });
        }

        return this._navigationController;
    }

    private _updateQueryPropertiesByItems(
        list: RecordSet,
        id?: TKey,
        navigationConfig?: IBaseSourceConfig,
        direction?: Direction
    ): void {
        if (this._hasNavigationBySource()) {
            this._getNavigationController(this._options.navigation)
                .updateQueryProperties(list, id, navigationConfig, NAVIGATION_DIRECTION_COMPATIBILITY[direction]);
        }
    }

    private _prepareQueryParams(
        queryParams: IQueryParams,
        key: TKey,
        navigationSourceConfig: INavigationSourceConfig,
        direction: Direction
        ): IQueryParams {
        const navigationController = this._getNavigationController(this._options.navigation);
        return navigationController.getQueryParams(
            {
                filter: queryParams.filter,
                sorting: queryParams.sorting
            },
            key,
            navigationSourceConfig,
            NAVIGATION_DIRECTION_COMPATIBILITY[direction]
        );
    }

    private _setItems(items: RecordSet): void {
        if (this._items && Controller._isEqualItems(this._items, items)) {
            this._items.setMetaData(items.getMetaData());
            this._items.assign(items);
        } else {
            this._subscribeItemsCollectionChangeEvent(items);
            this._items = items;
        }
    }

    private _load(
        direction?: Direction,
        key?: TKey,
        navigationSourceConfig?: INavigationSourceConfig
    ): Promise<LoadResult> {
        if (this._options.source) {
            this._loadPromise = new CancelablePromise(
                this._prepareFilterForQuery(key).then((preparedFilter: QueryWhereExpression<unknown>) => {
                    const crudWrapper = this._getCrudWrapper(this._options.source as ICrud);

                    let params = {
                        filter: preparedFilter,
                        sorting: this._options.sorting
                    } as IQueryParams;

                    if (this._hasNavigationBySource()) {
                        params = this._prepareQueryParams(params, key, navigationSourceConfig, direction);
                    }
                    return crudWrapper.query(params, this._options.keyProperty);
                }));

            this._loadPromise.promise
                .then((result) => {
                    this._loadPromise = null;
                    return this._processQueryResult(result, key, navigationSourceConfig, direction);
                })
                .catch((error) => {
                    this._loadPromise = null;
                    return error;
                });

            return this._loadPromise.promise;
        } else {
            Logger.error('source/Controller: Source option has incorrect type');
            return Promise.reject(new Error('source/Controller: Source option has incorrect type'));
        }
    }

    private _getFilterHierarchy(
        initialFilter: QueryWhereExpression<unknown>,
        options: IControllerOptions,
        root?: TKey): Promise<QueryWhereExpression<unknown>> {
        const rootForFilter = root || this._root;
        const expandedItemsForFilter = this._expandedItems || options.expandedItems;
        const parentProperty = this._parentProperty;
        const deepReload = this._deepReload || options.deepReload;
        let resultFilter = initialFilter;

        return new Promise((resolve) => {
            if (parentProperty) {
                resultFilter = {...initialFilter};

                if (expandedItemsForFilter?.length && expandedItemsForFilter?.[0] !== null && deepReload) {
                    resultFilter[parentProperty] = Array.isArray(resultFilter[parentProperty]) ?
                        resultFilter[parentProperty] :
                        [];
                    resultFilter[parentProperty].push(rootForFilter);
                    resultFilter[parentProperty] = resultFilter[parentProperty].concat(expandedItemsForFilter);
                } else if (rootForFilter !== undefined) {
                    resultFilter[parentProperty] = rootForFilter;
                }

                if (options.selectedKeys && options.selectedKeys.length) {
                    import('Controls/operations').then((operations) => {
                        resultFilter.entries = operations.selectionToRecord({
                            selected: options.selectedKeys,
                            excluded: options.excludedKeys
                        }, (options.source as IData).getAdapter());
                        resolve(resultFilter);
                    });
                } else {
                    resolve(resultFilter);
                }
            } else {
                resolve(resultFilter);
            }
        });
    }

    private _prepareFilterForQuery(key: TKey): Promise<QueryWhereExpression<unknown>> {
        return Controller._getFilterForCollapsedGroups(this._filter, this._options)
            .then((preparedFilter: QueryWhereExpression<unknown>) => {
                return this._getFilterHierarchy(preparedFilter, this._options, key);
            });
    }

    private _processQueryResult(
        result: LoadResult,
        key: TKey,
        navigationSourceConfig: INavigationSourceConfig,
        direction: Direction): LoadResult {
        if (result instanceof Error) {
            if (this._options.dataLoadErrback instanceof Function) {
                this._options.dataLoadErrback(result);
            }
        }
        if (result instanceof RecordSet) {
            this._updateQueryPropertiesByItems(result, key, navigationSourceConfig, direction);
        }
        return result;
    }

    private _subscribeItemsCollectionChangeEvent(items: RecordSet): void {
        this._unsubscribeItemsCollectionChangeEvent();
        items.subscribe('onCollectionChange', this._collectionChange);
    }

    private _unsubscribeItemsCollectionChangeEvent(): void {
        if (this._items) {
            this._items.unsubscribe('onCollectionChange', this._collectionChange);
        }
    }

    private _collectionChange(): void {
        if (this._hasNavigationBySource()) {
            this._getNavigationController(this._options.navigation).updateQueryRange(this._items, this._root);
        }
    }

    private _hasNavigationBySource(navigation?: INavigationOptionValue<unknown>): boolean {
        const navigationOption = navigation || this._options.navigation;
        return Boolean(navigationOption && navigationOption.source);
    }

    private static _isEqualItems(oldList: RecordSet, newList: RecordSet): boolean {
        const getProtoOf = Object.getPrototypeOf.bind(Object);
        return oldList && cInstance.instanceOfModule(oldList, 'Types/collection:RecordSet') &&
               (newList.getModel() === oldList.getModel()) &&
               (newList.getKeyProperty() === oldList.getKeyProperty()) &&
                // tslint:disable-next-line:triple-equals
               (getProtoOf(newList).constructor == getProtoOf(newList).constructor) &&
                // tslint:disable-next-line:triple-equals
               (getProtoOf(newList.getAdapter()).constructor == getProtoOf(oldList.getAdapter()).constructor);
    }

    private static _getFilterForCollapsedGroups(
        initialFilter: QueryWhereExpression<unknown>,
        options: IControllerOptions
    ): Promise<QueryWhereExpression<unknown>> {
        const hasGrouping = !!options.groupProperty || !!options.groupingKeyCallback;
        const historyId = hasGrouping ? (options.groupHistoryId || options.historyIdCollapsedGroups) : undefined;
        const collapsedGroups = options.collapsedGroups;
        const getFilterWithCollapsedGroups = (collapsedGroupsIds: TArrayGroupId) => {
            let modifiedFilter: Record<string, unknown> = {};
            if (collapsedGroupsIds && collapsedGroupsIds.length) {
                modifiedFilter = { ...initialFilter };
                modifiedFilter.collapsedGroups = collapsedGroupsIds;
            }
            return modifiedFilter;
        };
        let resultFilterPromise;

        if (collapsedGroups && collapsedGroups.length) {
            resultFilterPromise = Promise.resolve(getFilterWithCollapsedGroups(collapsedGroups));
        } else if (historyId) {
            resultFilterPromise = groupUtil.restoreCollapsedGroups(historyId).then(
                (restoredCollapsedGroups?: TArrayGroupId) => getFilterWithCollapsedGroups(restoredCollapsedGroups)
            );
        } else {
            resultFilterPromise = Promise.resolve(initialFilter);
        }

        return resultFilterPromise;
    }

}
