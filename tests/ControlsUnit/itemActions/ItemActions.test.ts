import {assert} from 'chai';
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ANIMATION_STATE, Collection, CollectionItem} from 'Controls/display';
import {IOptions as ICollectionOptions} from 'Controls/_display/Collection';

import {Controller as ItemActionsController, IItemActionsControllerOptions} from 'Controls/_itemActions/Controller';
import {
    IItemAction,
    IItemActionsItem,
    TActionDisplayMode,
    TItemActionShowType
} from 'Controls/_itemActions/interface/IItemActions';

// 3 опции будут показаны в тулбаре, 6 в контекстном меню
const itemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.MENU
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.MENU_TOOLBAR
    },
    {
        id: 3,
        icon: 'icon-Profile',
        title: 'Profile',
        tooltip: 'This is awesome Profile you\'ve never seen',
        showType: TItemActionShowType.TOOLBAR
    },
    {
        id: 4,
        icon: 'icon-Time',
        title: 'Time management',
        showType: TItemActionShowType.TOOLBAR,
        '@parent': true
    },
    {
        id: 5,
        title: 'Documentation',
        showType: TItemActionShowType.MENU,
        parent: 4
    },
    {
        id: 6,
        title: 'Development',
        showType: TItemActionShowType.MENU,
        parent: 4
    },
    {
        id: 7,
        title: 'Exploitation',
        showType: TItemActionShowType.MENU,
        parent: 4,
        '@parent': true
    },
    {
        id: 8,
        title: 'Approval',
        showType: TItemActionShowType.MENU,
        parent: 7,
        '@parent': true
    }
];

// Нет опций для контекстного меню
const flatItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.TOOLBAR
    }
];

// Нет опций для контекстного меню
const onlyOneItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.MENU
    }
];

// Только одна опция в тулбаре, одна - в контекстном меню
const horizontalOnlyItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.TOOLBAR
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.MENU
    }
];

// Варианты отображением иконки и текста
const displayModeItemActions: IItemAction[] = [
    {
        id: 1,
        icon: 'icon-PhoneNull',
        title: 'phone',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.ICON
    },
    {
        id: 2,
        icon: 'icon-EmptyMessage',
        title: 'message',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.TITLE
    },
    {
        id: 3,
        icon: 'icon-Profile',
        title: 'Profile',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.BOTH
    },
    {
        id: 4,
        icon: 'icon-Time',
        title: 'Time management',
        showType: TItemActionShowType.TOOLBAR,
        displayMode: TActionDisplayMode.AUTO
    }
];

const data = [
    {id: 1, name: 'Philip J. Fry', gender: 'M', itemActions: []},
    {
        id: 2,
        name: 'Turanga Leela',
        gender: 'F',
        itemActions: [
            {
                id: 1,
                icon: 'icon-Link',
                title: 'valar morghulis',
                showType: TItemActionShowType.TOOLBAR
            },
            {
                id: 2,
                icon: 'icon-Print',
                title: 'print',
                showType: TItemActionShowType.MENU
            }
        ]
    },
    {id: 3, name: 'Professor Farnsworth', gender: 'M', itemActions: []},
    {id: 4, name: 'Amy Wong', gender: 'F', itemActions: []},
    {id: 5, name: 'Bender Bending Rodriguez', gender: 'R', itemActions: []}
];

describe('Controls/_itemActions/Controller', () => {
    let itemActionsController: ItemActionsController;
    let collection: Collection<Record>; // IItemActionsCollection;
    let initialVersion: number;

    function makeCollection(rawData): Collection<Record> {

        const list = new RecordSet({
            keyProperty: 'id',
            rawData
        });
        const collectionConfig: ICollectionOptions<Record, IItemActionsItem> = {
            collection: list,
            keyProperty: 'id',
            leftSpacing: null,
            rightSpacing: null,
            rowSpacing: null,
            searchValue: null,
            editingConfig: null
        };
        return new Collection<Record>(collectionConfig);
    }

    function initializeControllerOptions(options?: IItemActionsControllerOptions): IItemActionsControllerOptions {
        return {
            collection: options ? options.collection : null,
            itemActions: options ? options.itemActions : null,
            itemActionsProperty: options ? options.itemActionsProperty : null,
            visibilityCallback: options ? options.visibilityCallback : null,
            itemActionsPosition: options ? options.itemActionsPosition : null,
            style: options ? options.style : null,
            theme: options ? options.theme : 'default',
            actionAlignment: options ? options.actionAlignment : null,
            actionCaptionPosition: options ? options.actionCaptionPosition : null,
            editingToolbarVisible: options ? options.editingToolbarVisible : false,
            editArrowAction: options ? options.editArrowAction : false,
            editArrowVisibilityCallback: options ? options.editArrowVisibilityCallback: null,
            contextMenuConfig: options ? options.contextMenuConfig: null,
            iconSize: options ? options.iconSize: 'm',
        };
    }

    beforeEach(() => {
        collection = makeCollection(data);
        // @ts-ignore
        initialVersion = collection.getVersion();
        itemActionsController = new ItemActionsController();
        itemActionsController.update(initializeControllerOptions({
            collection,
            itemActions,
            theme: 'default'
        }));
    });

    describe('Controller initialization is correct', () => {
        // T1.1.  Для каждого элемента коллекции задаётся набор операций.
        it('should assign item actions for every item', () => {
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            const actionsOf5 = collection.getItemBySourceKey(5).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotNull(actionsOf5, 'actions were not set to item 5');
            assert.equal(actionsOf1.showed[0].title, 'message', 'first action of item 1 should be \'message\'');
            assert.equal(actionsOf5.showed[0].title, 'message', 'first action of item 5 should be \'message\'');
        });

        // T1.2.  В коллекции происходит набор конфигурации для шаблона ItemActions.
        it('should build a config for item action template', () => {
            const config = collection.getActionsTemplateConfig();
            assert.isNotNull(config, 'getActionsTemplateConfig hasn\'t been set to collection');
        });

        // T1.3. При установке набора операций вызывается VisibilityCallback.
        it('should call visibilityCallback for every item action', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                visibilityCallback: (action: IItemAction, item: Record) => {
                    if (item.getKey() === 4 && action.id === 2) {
                        return false;
                    }
                    return true;
                }
            }));
            const actionsOf4 = collection.getItemBySourceKey(4).getActions();
            const actionsOf5 = collection.getItemBySourceKey(5).getActions();
            assert.isNotNull(actionsOf4, 'actions were not set to item 4');
            assert.isNotNull(actionsOf5, 'actions were not set to item 5');
            assert.notExists(actionsOf4.showed.find((action) => action.title === 'message'), 'item 4 should not display \'message\' action');
            assert.exists(actionsOf5.showed.find((action) => action.title === 'message'), 'item 5 should display \'message\' action');
        });

        // T1.4. При установке набора операций учитывается itemActionsProperty
        it('should consider itemActionsProperty', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsProperty: 'itemActions'
            }));
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            const actionsOf2 = collection.getItemBySourceKey(2).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotNull(actionsOf2, 'actions were not set to item 2');
            assert.isEmpty(actionsOf1.showed, 'What the hell any actions appeared for item 1?');
            assert.equal(actionsOf2.showed[0].title, 'valar morghulis');
        });

        // T1.6. После установки набора операций у коллекции устанавливается параметр actionsAssigned
        it('should set actionsAssigned value as true', () => {
            assert.isTrue(collection.isActionsAssigned());
        });

        // T1.7. Если требуется добавить кнопку меню, то она добавляется в список showed операций
        it('should append menu button to item actions when it necessary', () => {
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isTrue(actionsOf1.showed[actionsOf1.showed.length - 1]._isMenu, 'Menu button has not been appended to actions array');
        });

        // T1.7. Если не требуется добавить кнопку меню, то она не добавляется в список showed операций
        it('should not append menu button to item actions when it not necessary', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: flatItemActions,
                theme: 'default'
            }));
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotTrue(actionsOf1.showed[actionsOf1.showed.length - 1]._isMenu, 'What the hell menu button appeared for item?');
        });

        // T1.8. В список showed операций изначально попадают операции с showType TOOLBAR или MENU_TOOLBAR, и у которых нет родителя
        it('should add to "showed" item actions only actions with showType TOOLBAR or MENU_TOOLBAR, w/o parent', () => {
            const actionsOf4 = collection.getItemBySourceKey(4).getActions();
            assert.isNotNull(actionsOf4, 'actions were not set to item 4');
            assert.notEqual(actionsOf4.showed[0].title, 'phone', 'What the hell \'phone\' action is in \'showed\' array?');
        });

        // T1.8.1 При установке только одной опции нужно игнорировать showType и всё показывать как TOOLBAR
        it('should ignore showType and show action as its showType was TOOLBAR when it is the only action in list', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: onlyOneItemActions,
                theme: 'default'
            }));
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.isNotNull(actionsOf1, 'actions were not set to item 1');
            assert.isNotTrue(actionsOf1.showed[actionsOf1.showed.length - 1]._isMenu, 'It seems, that sly menu button came here!');
            assert.equal(actionsOf1.showed[actionsOf1.showed.length - 1].showType, TItemActionShowType.MENU, 'something strange happened to lonely item action...');
        });

        // T1.9. После установки набора операций, операции с иконками содержат в поле icon CSS класс “controls-itemActionsV__action_icon icon-size” (оч сомнительный тест)
        // TODO Возможно, установка этого класса переедет в шаблон
        it('should set "controls-itemActionsV__action_icon_theme-default icon-size_theme-default" CSS class for shown item actions icons', () => {
            const actionsOf5 = collection.getItemBySourceKey(5).getActions();
            assert.exists(actionsOf5, 'actions were not set to item 5');
            assert.notEqual(actionsOf5.showed[0].icon.indexOf('controls-itemActionsV__action_icon_theme'), -1, 'Css class \'controls-itemActionsV__action_icon_theme-\' should be added to item');
            assert.notEqual(actionsOf5.showed[0].icon.indexOf('icon-size_theme'), -1, 'Css class \'icon-size_theme-\' should be added to item');
        });

        // T1.10. При реальной смене у операций элементов настроек all/showed должна изменяться версия модели (если это возможно проверить)
        // TODO Возможно, это не корректный тест, т.к. по обсуждению от 08.05 была идея убрать смену версии модели из контроллера.
        it('should call collection version update after changing assigned actions', () => {
            // @ts-ignore
            assert.notEqual(collection.getVersion(), initialVersion);
        });

        // T1.11. Если в ItemActions всё пусто, не должно происходить инициализации
        it('should not initialize item actions when itemActions and itemActionsProperty are not set ', () => {
            collection = makeCollection(data);
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: null,
                theme: 'default'
            }));
            const actionsOf3 = collection.getItemBySourceKey(3).getActions();
            assert.notExists(actionsOf3, 'actions have been set to item 3, but they shouldn\'t');
        });

        // T1.12. При смене модели нужно менять модель также и в контроллере
        it('should change model inside controller when model is not the same', () => {
            const newData = [
                {id: 6, name: 'Doctor John Zoidberg', gender: 'M', itemActions: []},
                {id: 7, name: 'Zapp Brannigan', gender: 'M', itemActions: []}
            ];
            const newCollection = makeCollection(newData);
            itemActionsController.update(initializeControllerOptions({
                collection: newCollection,
                itemActions,
                theme: 'default',
            }));
            assert.exists(newCollection.getItemBySourceKey(6).getActions());
        });

        // T1.14 Необходимо корректно расчитывать showTitle, showIcon на основе displayMode
        describe('displayMode calculations', () => {
            beforeEach(() => {
                itemActionsController.update(initializeControllerOptions({
                    collection: collection,
                    itemActions: displayModeItemActions,
                    theme: 'default',
                }));
            });
            // T1.14.1. Должны учитываться расчёты отображения icon при displayMode=icon
            it('should consider showIcon calculations when displayMode=icon', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[0].showIcon, 'we expected to see icon here');
                assert.isNotTrue(actionsOf1.showed[0].showTitle, 'we didn\'t expect to see title here');
            });

            // T1.14.2. Должны учитываться расчёты отображения title при displayMode=title
            it('should consider showTitle calculations when displayMode=title', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[1].showTitle, 'we expected to see title here');
                assert.isNotTrue(actionsOf1.showed[1].showIcon, 'we didn\'t expect to see icon here');
            });

            // T1.14.3. Должны учитываться расчёты отображения title и icon при displayMode=both
            it('should consider showTitle calculations when displayMode=both', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[2].showTitle, 'we expected to see title here');
                assert.isTrue(actionsOf1.showed[2].showIcon, 'we expected to see icon here');
            });

            // T1.14.4. Должны учитываться расчёты отображения title и icon при displayMode=auto
            it('should consider showTitle calculations when displayMode=auto', () => {
                const actionsOf1 = collection.getItemBySourceKey(1).getActions();
                assert.isTrue(actionsOf1.showed[3].showIcon, 'we expected to see icon here');
                assert.isNotTrue(actionsOf1.showed[3].showTitle, 'we didn\'t expect to see title here');
            });
        });

        // T1.15. Если не указано свойство опции tooltip, надо подставлять title
        it('should change tooltip to title when no tooltip is set', () => {
            const actionsOf1 = collection.getItemBySourceKey(1).getActions();
            assert.equal(actionsOf1.showed[0].tooltip, 'message', 'tooltip should be the same as title here');
            assert.equal(actionsOf1.showed[1].tooltip, 'This is awesome Profile you\'ve never seen', 'tooltip should be not the same as title here');
        });

        // T1.16 Если редактируется или создаётся запись, actions будут добавлены в showed только для редактируемой записи
        it('should not add any item actions when records are editing', () => {
            const item3 = collection.getItemBySourceKey(3);
            item3.setEditing(true, item3.getContents());
            collection.setEditing(true);
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default'
            }));
            const actionsOf2 = collection.getItemBySourceKey(2).getActions();
            assert.equal(item3.getActions().showed.length, 4, 'item 4 is editing and should contain 4 itemActions');
            assert.equal(actionsOf2.showed.length, 0, 'item 4 is editing and item 2 should not contain any itemActions');
        });

        // T1.17. Должны адекватно набираться ItemActions для breadcrumbs (когда getContents() возвращает массив записей)
        // TODO возможно, это уйдёт из контроллера, т.к. по идее уровень абстракции в контроллере ниже и он не должен знать о breadcrumbs
        //  надо разобраться как в коллекцию добавить breadcrumbs
        // it('should set item actions when some items are breadcrumbs', () => {});

        // T1.18. Должны адекватно набираться ItemActions если в списке элементов коллекции присутствуют группы
        // TODO возможно, это уйдёт из контроллера, т.к. по идее уровень абстракции в контроллере ниже и он не должен знать о группах
        //  надо разобраться как в коллекцию добавить group
        // it('should set item actions when some items are groups', () => {});
    });

    // T2. Активация и деактивация Swipe происходит корректно
    describe('activateSwipe(), deactivateSwipe() and getSwipeItem() ', () => {
        // T2.1. В коллекции происходит набор конфигурации для Swipe, если позиция itemActions не outside. itemActions сортируются по showType.
        it('should collect swiped item actions sorted by showType when position !== "outside"', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsPosition: 'inside'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration for inside positioned actions');
            assert.equal(config.itemActions.showed[0].title, 'Profile', 'First item should be \'message\'');
        });

        // T2.2. В коллекции не происходит набор конфигурации для Swipe, если позиция itemActions outside
        it('should not collect swipe config when position === "outside"', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                itemActionsPosition: 'outside'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.notExists(config);
        });

        // T2.3. В зависимости от actionAlignment, для получения конфигурации используется правильный measurer
        it('should use horizontal measurer when actionAlignment=\'horizontal\'', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                actionAlignment: 'horizontal'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.isUndefined(config.twoColumns);
        });

        // T2.3. В зависимости от actionAlignment, для получения конфигурации используется правильный measurer
        // T2.5. Конфигурация для Swipe происходит с установкой twoColumnsActions, если measurer вернул в конфиг twoColumns
        it('should use vertical measurer when actionAlignment=\'vertical\'', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 65);
            const config = collection.getSwipeConfig();
            assert.isBoolean(config.twoColumns);
            assert.exists(config.twoColumnsActions);
        });

        // T2.4. Конфигурация для Swipe происходит с actionAlignment=’horizontal’, если только одна опция доступна в тулбаре
        it('should collect swipe configuration with actionAlignment="horizontal" when only one option should be showed in toolbar', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: horizontalOnlyItemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getSwipeConfig();
            assert.isUndefined(config.twoColumns);
        });

        // T2.4.1 Если actionAlignment был принудительно изменён, необходимо обновлять конфиг ItemActions
        it('should Update itemTemplateConfig when actionAlignment has been forced to change from vertical to horizontal', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions: horizontalOnlyItemActions,
                theme: 'default',
                actionAlignment: 'vertical'
            }));
            itemActionsController.activateSwipe(3, 50);
            const config = collection.getActionsTemplateConfig();
            assert.equal(config.actionAlignment, 'horizontal');
        });

        // T2.6. Устанавливается swiped элемент коллекции
        // T2.7. Устанавливается активный элемент коллекции
        // T2.8. Метод getSwipedItem возвращает корректный swiped элемент
        it('should set swiped and active collection item', () => {
            itemActionsController.activateSwipe(2, 50);
            const activeItem = collection.getActiveItem();
            const swipedItem: CollectionItem<Record> = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.exists(activeItem, 'Item has not been set active');
            assert.exists(swipedItem, 'Item has not been set swiped');
            assert.equal(activeItem, swipedItem, 'Active item is not the same as swiped item');
        });

        // T2.9. Происходит сброс swiped элемента, активного элемента, конфигурации для Swipe при деактивации свайпа
        it('should reset swiped item, active item and swipe configuration when deactivating swipe', () => {
            itemActionsController.activateSwipe(1, 50);
            itemActionsController.deactivateSwipe();
            const activeItem = collection.getActiveItem();
            const swipedItem: CollectionItem<Record> = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            const config = collection.getSwipeConfig();
            assert.notExists(activeItem, 'Item \'active\' flag has not been reset');
            assert.notExists(swipedItem, 'Item \'swiped\' flag has not been reset');
            assert.notExists(config, 'Collection\'s swipe config has not been reset');
        });

        // T2.10. При свайпе добавляется editArrow в набор операций, вызывается editArrowVisibilityCallback.
        it('should call add editArrow for every item action when necessary', () => {
            const editArrowAction: IItemAction = {
                id: 'view',
                icon: '',
                showType: TItemActionShowType.TOOLBAR,
            };
            let callbackIsCalled = false;
            const editArrowVisibilityCallback = () => {
                callbackIsCalled = true;
                return true;
            };
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                editArrowAction,
                editArrowVisibilityCallback
            }));
            itemActionsController.activateSwipe(1, 50);
            const config = collection.getSwipeConfig();
            assert.exists(config, 'Swipe activation should make configuration');
            assert.equal(config.itemActions.showed[0].id, 'view', 'First action should be \'editArrow\'');
        });

        // T2.11 При вызове activateRightSwipe нужно устанавливать в коллекцию анимацию right-swiped и isSwiped
        it('should right-swipe item on activateRightSwipe() method', () => {
            itemActionsController.activateRightSwipe(1);
            const item1 = collection.getItemBySourceKey(1);
            assert.isTrue(item1.isRightSwiped());
        });

        // T2.12 При вызове getSwipeItem() контроллер должен возвращать true вне зависимости от типа анимации и направления свайпа.
        it('method getSwipeItem() should return true despite of current animation type and direction', () => {
            const item: CollectionItem<Record> = collection.getItemBySourceKey(1);
            let swipedItem: CollectionItem<Record>;

            itemActionsController.activateRightSwipe(1);
            swipedItem = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.equal(swipedItem, item, 'rightSwiped() item has not been found by getSwipeItem() method');
            itemActionsController.deactivateSwipe();

            swipedItem = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.equal(swipedItem, null, 'Current swiped item has not been un-swiped');

            itemActionsController.activateSwipe(1, 50);
            swipedItem = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.equal(swipedItem, item, 'swiped() item has not been found by getSwipeItem() method');
            itemActionsController.deactivateSwipe();

            swipedItem = itemActionsController.getSwipeItem() as CollectionItem<Record>;
            assert.equal(swipedItem, null, 'Current swiped item has not been un-swiped');
        });
    });

    describe('prepareActionsMenuConfig()', () => {
        let clickEvent: SyntheticEvent<MouseEvent>;
        let target: HTMLElement;

        beforeEach(() => {
            target = {
                getBoundingClientRect(): ClientRect {
                    return {
                        bottom: 1,
                        height: 1,
                        left: 1,
                        right: 1,
                        top: 1,
                        width: 1
                    };
                }
            } as HTMLElement;
            const native = {
                target
            };
            clickEvent = new SyntheticEvent<MouseEvent>(native);
        });

        // T3.1. Если в метод передан parentAction и это не кнопка открытия меню, то config.templateOptions.showHeader будет true
        it('should set config.templateOptions.showHeader \'true\' when parentAction is set and item isn\'t _isMenu', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, false);
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.isTrue(config.templateOptions.showHeader);
        });

        // T3.2. Если в метод не передан parentAction, то config.templateOptions.showHeader будет false
        it('should set config.templateOptions.showHeader \'false\' when parentAction isn\'t set', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, null, null, false);
            assert.exists(config.templateOptions, 'Template options were not set when no parent passed');
            assert.isFalse(config.templateOptions.showHeader, 'showHeader should be false when no parent passed');
        });

        // T3.2. Если в метод parentAction - это кнопка открытия меню, то config.templateOptions.showHeader будет false
        it('should set config.templateOptions.showHeader \'false\' when parentAction is _isMenu', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, actionsOf3.showed[actionsOf3.length - 1], null, false);
            assert.exists(config.templateOptions, 'Template options were not set when no isMenu parent passed');
            assert.isFalse(config.templateOptions.showHeader, 'showHeader should be false when isMenu parent passed');
        });

        // T3.6. Result.templateOptions.source содержит меню из ItemActions, соответствующих текущему parentAction
        // it('returns an empty array if actions are not set');
        // it('returns actions with showType of MENU and MENU_TOOLBAR');
        // it('returns child actions');
        it('should set result.templateOptions.source responsible to current parentActions', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, false);
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.exists(config.templateOptions.source, 'Menu actions source haven\'t been set in template options');
            // @ts-ignore
            const calculatedChildren = JSON.stringify(config.templateOptions.source.data);
            const children = JSON.stringify(itemActions.filter((action) => action.parent === itemActions[3].id));
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.equal(calculatedChildren, children);
        });

        // T3.7. Result.templateOptions.source содержит меню из всех ItemActions не-первого уровня, если в качестве parentAction была указана кнопка “Показать меню”
        it('should set result.templateOptions.source as set of all non-first-level ItemActions when parentAction is _isMenu', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, actionsOf3.showed[actionsOf3.length - 1], null, false);
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.exists(config.templateOptions.source, 'Menu actions source hasn\'t been set in template options');
            // @ts-ignore
            const calculatedChildren = config.templateOptions.source.data.map((item) => item.id).join('');
            const children = itemActions
                .filter((action) => (
                    action.parent !== undefined || action.showType === TItemActionShowType.MENU || action.showType === TItemActionShowType.MENU_TOOLBAR)
                ).map((item) => item.id).join('');
            assert.equal(calculatedChildren, children);
        });

        // T3.3. Если в метод передан contextMenu=true, то в config.direction.horizontal будет right, иначе left
        it('should set config.direction.horizontal as \'right\' when contextMenu=true', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, true);
            assert.exists(config.direction, 'Direction options were not set');
            assert.equal(config.direction.horizontal, 'right');
        });

        // T3.3. Если в метод передан contextMenu=true, то в config.direction.horizontal будет right, иначе left
        it('should set result.direction.horizontal as \'left\' when contextMenu=false', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, false);
            assert.exists(config.direction, 'Direction options were not set');
            assert.equal(config.direction.horizontal, 'left');
        });

        // T3.4. Если в метод передан contextMenu=false, то в config.target будет объект с копией clickEvent.target.getBoundingClientRect()
        it('should set config.target as copy of clickEvent.target.getBoundingClientRect()', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, false);
            assert.deepEqual(config.target.getBoundingClientRect(), target.getBoundingClientRect());
        });

        // T3.5. Если был установлен iconSize он должен примениться к templateOptions
        it('should apply iconSize to templateOptions', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, actionsOf3.showed[actionsOf3.length - 1], null, false);
            assert.exists(config.templateOptions, 'Template options were not set');
            assert.equal(config.templateOptions.iconSize, 'm', 'iconSize from templateOptions has not been applied');
        });

        // T3.6. Если в контрол был передан contextMenuConfig, его нужно объединять с templateOptions для Sticky.openPopup(menuConfig)
        it('should merge contextMenuConfig with templateOptions for popup config', () => {
            itemActionsController.update(initializeControllerOptions({
                collection,
                itemActions,
                theme: 'default',
                contextMenuConfig: {
                    iconSize: 's',
                    groupProperty: 'title'
                }
            }));
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, false);
            assert.equal(config.templateOptions.groupProperty, 'title', 'groupProperty from contextMenuConfig has not been applied');
            assert.equal(config.templateOptions.headConfig.iconSize, 's', 'iconSize from contextMenuConfig has not been applied');
        });

        // T3.7. Для меню не нужно считать controls-itemActionsV__action_icon_theme-default
        it('should not set "controls-itemActionsV__action_icon_theme-default" CSS class for menu item actions icons', () => {
            const item3 = collection.getItemBySourceKey(3);
            const actionsOf3 = item3.getActions();
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, actionsOf3.showed[actionsOf3.length - 1], null, false);
            const calculatedChildren = config.templateOptions.source;
            assert.exists(calculatedChildren, 'Menu actions source haven\'t been set in template options');
            assert.equal(calculatedChildren.data[0].icon.indexOf('controls-itemActionsV__action_icon_theme'), -1, 'Css class \'controls-itemActionsV__action_icon_theme-\' should not be added to menu item');
        });

        it('should set config.fittingMode.vertical as \'overflow\'', () => {
            const item3 = collection.getItemBySourceKey(3);
            const config = itemActionsController.prepareActionsMenuConfig(item3, clickEvent, itemActions[3], null, false);
            assert.exists(config.fittingMode, 'Direction options were not set');
            assert.equal(config.fittingMode.vertical, 'overflow');
            assert.equal(config.fittingMode.horizontal, 'adaptive');
        });
    });

    // см. этот же тест в Collection.test.ts
    describe('setActiveItem(), getActiveItem()', () => {
        it('deactivates old active item', () => {
            const testingItem = collection.getItemBySourceKey(1);
            itemActionsController.setActiveItem(collection.getItemBySourceKey(1));
            itemActionsController.setActiveItem(collection.getItemBySourceKey(2));
            assert.isFalse(testingItem.isActive());
        });
        it('activates new active item', () => {
            const testingItem = collection.getItemBySourceKey(2);
            itemActionsController.setActiveItem(collection.getItemBySourceKey(1));
            itemActionsController.setActiveItem(collection.getItemBySourceKey(2));
            assert.isTrue(testingItem.isActive());
        });
        it('correctly returns active item', () => {
            const testingItem = collection.getItemBySourceKey(2);
            itemActionsController.setActiveItem(collection.getItemBySourceKey(2));
            assert.equal(itemActionsController.getActiveItem(), testingItem);
        });
    });

    describe('setSwipeAnimation(), getSwipeAnimation()', () => {
        it('should correctly set animation state', () => {
            itemActionsController.setSwipeAnimation(ANIMATION_STATE.CLOSE);
            assert.equal(itemActionsController.getSwipeAnimation(), ANIMATION_STATE.CLOSE, 'Incorrect animation state !== close');

            itemActionsController.setSwipeAnimation(ANIMATION_STATE.OPEN);
            assert.equal(itemActionsController.getSwipeAnimation(), ANIMATION_STATE.OPEN, 'Incorrect animation state !== open');
        })
    });


});
