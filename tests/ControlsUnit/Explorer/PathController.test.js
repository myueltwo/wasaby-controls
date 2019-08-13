define([
   'Controls/_explorer/PathController',
   'Controls/_breadcrumbs/HeadingPath/Back',
   'Types/entity'
], function(
   PathController,
   PathBack,
   entity
) {
   describe('Controls.Explorer._PathController', function() {
      var items = [{
         id: 0,
         title: 'first',
         counterCaption: 1
      }, {
         id: 1,
         title: 'second',
         counterCaption: 2
      }].map(function(item) {
         return new entity.Model({
            idProperty: 'id',
            rawData: item
         });
      });
      describe('_beforeMount', function() {
         it('without header', function() {
            var instance = new PathController();
            instance._beforeMount({});
            assert.isNotOk(instance._header);
         });
         it('with header, first item has title', function() {
            var
               instance = new PathController(),
               header = [{
                  title: '123'
               }];
            instance._beforeMount({
               header: header
            });
            assert.isNotOk(instance._header);
         });
         it('with header, first item has template', function() {
            var
               instance = new PathController(),
               header = [{
                  template: function() {
                     return '<div>123</div>';
                  }
               }];
            instance._beforeMount({
               header: header
            });
            assert.isNotOk(instance._header);
         });
         it('with header, first item doesn\'t have neither title nor template', function() {
            var
               instance = new PathController(),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }];
            instance._beforeMount({
               header: header,
               items: items,
               displayProperty: 'title'
            });
            assert.deepEqual(instance._header, [{
               template: PathBack.default,
               templateOptions: {
                  backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
                  backButtonStyle: undefined,
                  backButtonCaption: 'second',
                  counterCaption: 2
               },
               width: '100px',
               isBreadCrumbs: true
            }, {
               title: 'second'
            }]);
         });
      });
      describe('needCrumbs', function() {
         var pathController = new PathController();
         var needCrumbs = PathController._private.needCrumbs;
         it('BackButton is in header, items.length === 1', function() {
            assert.isFalse(needCrumbs([{title:'back'}], ['first'], false));
         });
         it('BackButton is not in header, items.length === 1', function() {
            assert.isTrue(needCrumbs(undefined, ['first'], false));
         });
         it('BackButton is in header, items.length === 2', function() {
            assert.isTrue(needCrumbs([{title:'back'}], ['first','second'], false));
         });
         it('items === null', function() {
            assert.isFalse(needCrumbs(undefined, null, false));
         });
         it('items === null, rootVisible (when dragging from folder)', function() {
            assert.isTrue(needCrumbs(undefined, null, true));
         });
      });
      describe('needShadow', function() {
         var needShadow = PathController._private.needShadow;
         it('there is no header, we need shadow', function() {
            assert.isTrue(needShadow(undefined, undefined));
         });
         it('there is header, we do not need shadow', function() {
            assert.isFalse(needShadow(undefined, [{title:"title"}]));
         });
         it('there is header, we do not need shadow', function() {
            assert.isFalse(needShadow([{title:"backButton"}], [{title:""}]));
         });

      });
      describe('_beforeUpdate', function() {
         it('old items + update header', async function() {
            var
               cfg = {
                  items: items,
                  header: [{}]
               },
               newCfg = {
                  items: items,
                  header: [{}, {}]
               },
               instance = new PathController(cfg);
            instance.saveOptions(cfg);
            await instance._beforeMount(cfg);
            assert.equal(1, instance._header.length);
            instance._beforeUpdate(newCfg);
            assert.equal(2, instance._header.length);
         });
         it('new items', function() {
            var
               instance = new PathController(),
               header = [{
                  align: 'right',
                  width: '100px'
               }, {
                  title: 'second'
               }];
            instance._header = [];
            instance.saveOptions({
               items: items
            });
            instance._beforeUpdate({
               header: header,
               items: items.slice(),
               displayProperty: 'title'
            });
            assert.deepEqual(instance._header, [{
               template: PathBack.default,
               templateOptions: {
                  backButtonStyle: undefined,
                  backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
                  backButtonCaption: 'second',
                  counterCaption: 2
               },
               width: '100px',
               isBreadCrumbs: true
            }, {
               title: 'second'
            }]);
         });
      });
      it('_onBackButtonClick', function() {
         var instance = new PathController();
         instance.saveOptions({
            items: items,
            keyProperty: 'id',
            parentProperty: 'parent',
            root: null
         });
         instance._notify = function(e, args) {
            if (e === 'itemClick') {
               assert.equal(instance._options.items[instance._options.items.length - 2].get('parent'), args[0].get('parent'));
            }
         };
         instance._onBackButtonClick({
            stopPropagation: function() {

            }
         });
      });
      it('_onArrowClick', function() {
         var
            instance = new PathController(),
            onarrowActivatedFired = false;
         instance._notifyHandler = function(e) {
            if (e === 'arrowClick') {
               onarrowActivatedFired = true;
            }
         };
         instance._notifyHandler('arrowClick');
         assert.isTrue(onarrowActivatedFired);
      });
   });
});
