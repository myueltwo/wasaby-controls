define([
   'Controls/_list/BaseControl/SelectionController',
   'Types/collection',
   'Types/entity',
   'Controls/operations',
   'Controls/list',
   'Controls/treeGrid',
   'ControlsUnit/ListData',
   'Controls/display'
], function(
   SelectionController,
   collection,
   entity,
   operations,
   list,
   treeGrid,
   ListData,
   display
) {
   'use strict';
   describe('Controls.List.BaseControl.SelectionController', function() {
      let instance;
      let instanceWithNewModel;
      let rs;
      let cfg;
      let sandbox;
      let commonConfig;

      beforeEach(function() {
         sandbox = sinon.createSandbox();
         rs = new collection.RecordSet({
            keyProperty: ListData.KEY_PROPERTY,
            rawData: ListData.getItems()
         });
         commonConfig = {
            selectedKeys: [],
            excludedKeys: [],
            items: rs,
            parentProperty: ListData.PARENT_PROPERTY,
            nodeProperty: ListData.NODE_PROPERTY,
            selectDescendants: true,
            selectAncestors: true,
            nodesSourceControllers: new Map(),
            keyProperty: ListData.KEY_PROPERTY
         };
         instance = new SelectionController();
         instance.saveOptions({
            ...commonConfig,
            listModel: new treeGrid.ViewModel({columns: [], items: rs})
         });

         instanceWithNewModel = new SelectionController();
         instanceWithNewModel.saveOptions({
            ...commonConfig,
            listModel: new display.Collection({
               items: rs,
               keyProperty: commonConfig.keyProperty
            })
         });
      });

      afterEach(function() {
         sandbox.restore();
      });

      it('_beforeMount with flat list', async function() {
         var flatListCfg = {
            selectedKeys: [],
            excludedKeys: [],
            keyProperty: 'id',
            selectDescendants: false,
            selectAncestors: false,
            listModel: new list.ListViewModel({items: rs})
         };
         var inst = new SelectionController();
         await inst._beforeMount(flatListCfg);
         assert.isTrue(inst._multiselection instanceof operations.Selection);
      });

      it('_afterMount', async function() {
         await instance._beforeMount(cfg);
         const stubNotify = sandbox.stub(instance, '_notify');
         instance._afterMount();
         assert.isTrue(stubNotify.withArgs('register', ['selectedTypeChanged', instance, SelectionController._private.selectedTypeChangedHandler], {bubbling: true}).calledOnce);
         assert.isTrue(instance._options.items.hasEventHandlers('onCollectionChange'));
         assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [0, false], { bubbling: true }).calledOnce);
      });

      describe('_beforeUpdate', function() {
         it('change items', async function() {
            await instance._beforeMount(cfg);
            instance._afterMount();
            var newItems = new collection.RecordSet({
               keyProperty: ListData.KEY_PROPERTY,
               rawData: ListData.getItems()
            });
            var newCfg = Object.assign({}, cfg);
            newCfg.items = newItems;
            const stubNotify = sandbox.stub(instance, '_notify');
            instance._beforeUpdate(newCfg);
            assert.isFalse(stubNotify.called);
         });

         it('change selectedKeys', async function() {
            var newCfg = Object.assign({}, cfg);

            await instance._beforeMount(cfg);
            instance._afterMount();
            const stubNotify = sandbox.stub(instance, '_notify');

            newCfg.selectedKeys = [3, 4];
            instance._beforeUpdate(newCfg);
            assert.deepEqual(instance._multiselection.selectedKeys, newCfg.selectedKeys);
            assert.deepEqual(instance._multiselection.excludedKeys, newCfg.excludedKeys);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [2, false], { bubbling: true }).calledOnce);

            // Выбрать все и все записи в исключениях, проверим что selectedKeys сбросится
            newCfg.selectedKeys = [null];
            newCfg.excludedKeys = [null, 1, 6, 7];
            instance._multiselection._listModel.getItems().setMetaData({more: false});
            instance._beforeUpdate(newCfg);
            assert.deepEqual(instance._multiselection.selectedKeys, newCfg.selectedKeys);
            assert.deepEqual(instance._multiselection.excludedKeys, newCfg.excludedKeys);
            assert.isTrue(stubNotify.withArgs('selectedKeysChanged', [[], [], [null]]).calledOnce);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [0, false], { bubbling: true }).calledOnce);

            newCfg.selectedKeys = [null];
            newCfg.excludedKeys = [null];
            instance._beforeUpdate(newCfg);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [7, true], { bubbling: true }).calledOnce);

            newCfg.selectedKeys = [null];
            newCfg.excludedKeys = [null];
            instance._multiselection._listModel.getItems().clear();
            instance._beforeUpdate(newCfg);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [0, false], { bubbling: true }).calledOnce);
         });

         it('change list model', async function() {
            let newCfg = Object.assign({}, cfg);
            await instance._beforeMount(cfg);
            instance._afterMount();

            newCfg.listModel.updateSelection = sandbox.stub();
            newCfg.selectedKeys = [3, 4];
            instance._multiselection.setListModel = sandbox.stub();
            instance._beforeUpdate(newCfg);

            assert.isTrue(newCfg.listModel.updateSelection.withArgs({'1': null, '2': null, '3': true, '4': true}).calledOnce);
         });

         it('change items and model', async function () {
            let newItems = new collection.RecordSet({
               keyProperty: ListData.KEY_PROPERTY,
               rawData: ListData.getItems()
            });
            let newCfg = Object.assign({}, cfg);
            await instance._beforeMount(cfg);
            instance._afterMount();
            let initialListModel = instance._options.listModel;

            newCfg.items = newItems;
            newCfg.listModel = new treeGrid.ViewModel({columns: [], items: rs});
            newCfg.listModel.updateSelection = sandbox.stub();
            initialListModel.updateSelection = sandbox.stub();
            instance._beforeUpdate(newCfg);

            assert.isFalse(initialListModel.updateSelection.called);
            assert.isTrue(newCfg.listModel.updateSelection.withArgs({}).calledOnce);
         });

         it('change filter', async function () {
            var newCfg = Object.assign({}, cfg);
            await instance._beforeMount(cfg);
            instance._afterMount();

            newCfg.selectedKeys = [null];
            newCfg.excludedKeys = [null];
            instance._beforeUpdate(newCfg);
            assert.deepEqual(instance._multiselection.selectedKeys, newCfg.selectedKeys);
            assert.deepEqual(instance._multiselection.excludedKeys, newCfg.excludedKeys);

            newCfg.filter = {testField: 'testValue'};
            instance._beforeUpdate(newCfg);
            assert.deepEqual(instance._multiselection.selectedKeys, newCfg.selectedKeys);
            assert.deepEqual(instance._multiselection.excludedKeys, newCfg.excludedKeys);
            assert.isTrue(instance._resetSelection);
         });

         it('change root', async function () {
            var newCfg = Object.assign({}, cfg);
            await instance._beforeMount(cfg);
            instance._afterMount();

            newCfg.selectedKeys = [1, 2];
            newCfg.excludedKeys = [3];
            instance._beforeUpdate(newCfg);
            assert.deepEqual(instance._multiselection.selectedKeys, newCfg.selectedKeys);
            assert.deepEqual(instance._multiselection.excludedKeys, newCfg.excludedKeys);

            newCfg.root = 4;
            instance._beforeUpdate(newCfg);
            assert.deepEqual(instance._multiselection.selectedKeys, newCfg.selectedKeys);
            assert.deepEqual(instance._multiselection.excludedKeys, newCfg.excludedKeys);
            assert.isFalse(instance._resetSelection);
         });
      });

      describe('onCheckBoxClick', function() {
         var
            selectCalled,
            unselectCalled;

         beforeEach(function() {
            selectCalled = false;
            unselectCalled = false;
         });

         function wrapMultiselectionMethods(inst) {
            var oldSelect = inst._multiselection.select;
            inst._multiselection.select = function(key) {
               oldSelect.call(inst._multiselection, key);
               selectCalled = true;
            };
            var oldUnselect = inst._multiselection.unselect;
            inst._multiselection.unselect = function(key) {
               oldUnselect.call(inst._multiselection, key);
               unselectCalled = true;
            };
         }

         it('select item', async function() {
            await instance._beforeMount(cfg);
            wrapMultiselectionMethods(instance);
            const stubNotify = sandbox.stub(instance, '_notify');
            instance.onCheckBoxClick(1, false);
            assert.isTrue(selectCalled);
            assert.isFalse(unselectCalled);
            assert.isTrue(stubNotify.withArgs('selectedKeysChanged', [[1], [1], []]).calledOnce);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [5, false], { bubbling: true }).calledOnce);
         });

         it('unselect item', async function() {
            await instance._beforeMount(cfg);
            wrapMultiselectionMethods(instance);
            instance._options.selectedKeys = [1];
            instance._options.selectedKeysCount = 5;
            instance._multiselection._selectedKeys = [1];
            const stubNotify = sandbox.stub(instance, '_notify');
            instance.onCheckBoxClick(1, true);
            assert.isFalse(selectCalled);
            assert.isTrue(unselectCalled);
            assert.isTrue(stubNotify.withArgs('selectedKeysChanged', [[], [], [1]]).calledOnce);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [0, false], { bubbling: true }).calledOnce);
         });

         it('unselect nested item when parent is selected', async function() {
            await instance._beforeMount(cfg);
            wrapMultiselectionMethods(instance);
            instance._options.selectedKeys = [1];
            instance._options.selectedKeysCount = 5;
            instance._multiselection._selectedKeys = [1];
            const stubNotify = sandbox.stub(instance, '_notify');
            instance.onCheckBoxClick(2, true);
            assert.isFalse(selectCalled);
            assert.isTrue(unselectCalled);
            assert.isTrue(stubNotify.withArgs('excludedKeysChanged', [[2], [2], []]).calledOnce);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [2, false], { bubbling: true }).calledOnce);
         });
      });

      describe('_beforeUnmount', async function() {

         it('_beforeUnmount with old model', () => {
            const config = {...cfg};
            const numHandlersCollectionChange = config.items.getEventHandlers('onCollectionChange').length;
            config.selectedKeys = ['testId'];
            config.excludedKeys = ['testId'];
            instance.saveOptions(config);
            instance.getRoot = () => {
               return null;
            };
            await instance._beforeMount(config);
            instance._afterMount();
            const stubNotify = sandbox.stub(instance, '_notify');
            instance._options.listModel.updateSelection = sandbox.stub();
            assert.notEqual(numHandlersCollectionChange, cfg.items.getEventHandlers('onCollectionChange').length);
            instance._beforeUnmount();
            assert.isTrue(instance._options.listModel.updateSelection.withArgs({}).calledOnce);
            assert.isNull(instance._multiselection);
            assert.equal(numHandlersCollectionChange, cfg.items.getEventHandlers('onCollectionChange').length);
            assert.isNull(instance._onCollectionChangeHandler);
            assert.isTrue(stubNotify.withArgs('unregister', ['selectedTypeChanged', instance], { bubbling: true }).calledOnce);
            assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [0], { bubbling: true }).calledOnce);
         });

         it('_beforeUnmount with new model', async () => {
            instanceWithNewModel._options.selectedKeys = [1];
            instanceWithNewModel._options.excludedKeys = [2];
            await instanceWithNewModel._beforeMount(instanceWithNewModel._options);

            instanceWithNewModel._afterMount();
            assert.isTrue(instanceWithNewModel._listModel.getSelectedItems().length > 1);

            instanceWithNewModel._beforeUnmount();
            assert.isTrue(instanceWithNewModel._listModel.getSelectedItems().length === 0);

         });
      });

      it('_private.selectedTypeChangedHandler', async function() {
         await instance._beforeMount(cfg);
         instance._multiselection.toggleAll = sandbox.stub();
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'toggleAll');
         assert.isTrue(instance._multiselection.toggleAll.calledOnce);
         instance._multiselection.selectAll = sandbox.stub();
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll');
         assert.isTrue(instance._multiselection.selectAll.calledOnce);
         instance._multiselection.unselectAll = sandbox.stub();
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'unselectAll');
         assert.isTrue(instance._multiselection.unselectAll.calledOnce);

         cfg.items = cfg.items.clone();
         cfg.items.clear();
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll');
         assert.isTrue(instance._multiselection.selectAll.calledOnce);
      });

      describe('_onCollectionChange', function() {
         it('remove', async function() {
            await instance._beforeMount(cfg);
            instance._afterMount();
            instance._multiselection.remove = sandbox.stub();
            instance._options.items.remove(instance._options.items.getRecordById(3));
            assert.isTrue(instance._multiselection.remove.withArgs([3]).calledOnce);
         });

         it('add', async function() {
            await instance._beforeMount(cfg);
            instance._afterMount();
            instance._multiselection.unselect = sandbox.stub();
            instance._options.items.add(new entity.Record({
               rawData: {
                  'id': 11,
                  'Раздел': null,
                  'Раздел@': true
               }
            }));
            assert.isFalse(instance._multiselection.unselect.called);
         });

         it('assign', async function() {
            const cfgWithSelectedKeys = {...cfg};
            cfgWithSelectedKeys.selectedKeys = [1];
            cfgWithSelectedKeys.excludedKeys = [2];
            await instance._beforeMount(cfgWithSelectedKeys);
            instance._afterMount();

            assert.deepEqual(instance._multiselection.selectedKeys, [1]);
            assert.deepEqual(instance._multiselection.excludedKeys, [2]);

            instance._resetSelection = true;
            instance._options.items.assign([instance._options.items.getRecordById(3)]);
            assert.deepEqual(instance._multiselection.selectedKeys, []);
            assert.deepEqual(instance._multiselection.excludedKeys, []);
         });
      });

      it('onCollectionChange handler', async function() {
         await instance._beforeMount(cfg);
         instance._afterMount();
         const stubNotify = sandbox.stub(instance, '_notify');

         instance._options.listModel.updateSelection = sandbox.stub();
         instance._onCollectionChangeHandler();
         assert.isTrue(instance._options.listModel.updateSelection.withArgs({}).calledOnce);
         assert.isTrue(stubNotify.withArgs('listSelectedKeysCountChanged', [0, false], { bubbling: true }).called);
      });
   });
});
