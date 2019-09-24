define(['Controls/_grid/ColumnScroll', 'Types/entity', 'Core/core-clone'], function(ColumnScroll, Entity, Clone) {

   'use strict';

   describe('Controls.ColumnScroll', function() {
      var
         cfg = {
            items: {
               getCount: () => 1
            },
            header: [{}, {}, {}],
            multiSelectVisibility: 'visible',
            stickyColumnsCount: 1,
            listModel: {
               isFullGridSupport: () => true,
               getResultsPosition: () => undefined,
               getItems: () => ({
                  getCount: () => 3
               })
            }
         },
         columnScroll = new ColumnScroll(cfg);

      columnScroll._children = {
         contentStyle: {
            innerHTML: ''
         },
         content: {
            getElementsByClassName: () => {
               return [{
                  scrollWidth: 500,
                  offsetWidth: 250,
                  getBoundingClientRect: () => {
                     return {
                        left: 20
                     }
                  },
                  querySelector: function() {
                     return {
                        getBoundingClientRect: () => {
                           return {
                              left: 44
                           }
                        },
                        offsetWidth: 76
                     };
                  }
               }]
            }
         }
      };

      it('_beforeMount', function() {
         var
            baseCreateGuid = Entity.Guid.create;
         Entity.Guid.create = function() {
            return '1234567890';
         };
         cfg.listModel.isFullGridSupport = () => true;
         cfg.listModel.isNoGridSupport = () => false;
         columnScroll._beforeMount(cfg);
         Entity.Guid.create = baseCreateGuid;
         assert.equal(columnScroll._transformSelector, 'controls-ColumnScroll__transform-1234567890');
         assert.equal(columnScroll._scrollPosition, 0);
      });
      it('_afterMount', function() {
         columnScroll.saveOptions(cfg);
         columnScroll._afterMount(cfg);
         assert.equal(columnScroll._contentSize, 500);
         assert.equal(columnScroll._contentContainerSize, 250);
         assert.deepEqual(columnScroll._shadowState, 'end');
         assert.deepEqual(columnScroll._fixedColumnsWidth, 100);
      });

      it('_afterMount + _afterUpdate non-default stickyColumnsCount', function() {
         var
            changedCfg = Object.assign({}, cfg, { stickyColumnsCount: 3 }),
            sccColumnScroll = new ColumnScroll(changedCfg);

         sccColumnScroll._children = {
            contentStyle: {
               innerHTML: ''
            },
            content: {
               getElementsByClassName: () => {
                  return [{
                     scrollWidth: 600,
                     offsetWidth: 400,
                     getBoundingClientRect: () => {
                        return {
                           left: 20
                        }
                     },
                     querySelector: function (selector) {
                        var column = parseInt(selector.slice('.controls-Grid__cell_fixed:nth-child('.length), 10);
                        // make every fixed column 50 pixels
                        return {
                           getBoundingClientRect: () => {
                              return {
                                 left: 44 + ((column - 1) * 50)
                              }
                           },
                           offsetWidth: 26
                        };
                     }
                  }]
               }
            }
         };
         sccColumnScroll.saveOptions(changedCfg);
         sccColumnScroll._afterMount(changedCfg);
         assert.strictEqual(sccColumnScroll._contentSize, 600);
         assert.strictEqual(sccColumnScroll._contentContainerSize, 400);
         assert.strictEqual(sccColumnScroll._shadowState, 'end');
         // 3 * 50 pixels fixed columns + 1 * 50 pixels multiselect column
         assert.strictEqual(sccColumnScroll._fixedColumnsWidth, 200);

         // check with hidden multiselect
         var noMultiselectCfg = Object.assign({}, changedCfg, { multiSelectVisibility: 'hidden' });
         // reset values
         sccColumnScroll._contentSize = 0;
         sccColumnScroll._contentContainerSize = 0;

         sccColumnScroll.saveOptions(noMultiselectCfg);
         sccColumnScroll._afterMount(noMultiselectCfg);
         assert.strictEqual(sccColumnScroll._contentSize, 600);
         assert.strictEqual(sccColumnScroll._contentContainerSize, 400);
         assert.strictEqual(sccColumnScroll._fixedColumnsWidth, 150);

         // can update fixed column count
         var updatedCfg = Object.assign({}, noMultiselectCfg, { stickyColumnsCount: 5 });
         sccColumnScroll.saveOptions(updatedCfg);
         sccColumnScroll._afterUpdate(noMultiselectCfg);
         assert.strictEqual(sccColumnScroll._fixedColumnsWidth, 250);
      });

      it('_afterMount with columnScrollStartPosition===end', function() {
         const
            cfg = {
               items: {
                  getCount: () => 1
               },
               header: [{}, {}, {}],
               multiSelectVisibility: 'visible',
               stickyColumnsCount: 1,
               columnScrollStartPosition: 'end',
               listModel: {
                  isFullGridSupport: () => true,
                  getResultsPosition: () => undefined
               }
            },
            endColumnScroll = new ColumnScroll(cfg);

         endColumnScroll._children = {
            contentStyle: {
               innerHTML: ''
            },
            content: {
               getElementsByClassName: () => {
                  return [{
                     scrollWidth: 500,
                     offsetWidth: 250,
                     getBoundingClientRect: () => {
                        return {
                           left: 20
                        }
                     },
                     querySelector: function() {
                        return {
                           getBoundingClientRect: () => {
                              return {
                                 left: 44
                              }
                           },
                           offsetWidth: 76
                        };
                     }
                  }]
               }
            }
         };

         endColumnScroll.saveOptions(cfg);
         endColumnScroll._options.listModel.getItems = () => ({
            getCount: () => 3
         });
         endColumnScroll._afterMount(cfg);
         assert.strictEqual(endColumnScroll._contentSize, 500);
         assert.strictEqual(endColumnScroll._contentContainerSize, 250);
         assert.strictEqual(endColumnScroll._fixedColumnsWidth, 100);

         assert.strictEqual(endColumnScroll._scrollPosition, 250);
         // no end shadow - columns are scrolled to the end
         assert.strictEqual(endColumnScroll._shadowState, 'start');
      });

      it('_afterUpdate: should update sizes if columns has been changed', function () {
         let clearColumnScroll = new ColumnScroll(cfg);

         clearColumnScroll._children = {
            contentStyle: {
               innerHTML: ''
            },
            content: {
               getElementsByClassName: () => {
                  return [{
                     scrollWidth: 500,
                     offsetWidth: 250,
                     getBoundingClientRect: () => {
                        return {
                           left: 20
                        }
                     },
                     querySelector:

                         function () {
                            return {
                               getBoundingClientRect: () => {
                                  return {
                                     left: 44
                                  }
                               },
                               offsetWidth: 76
                            };
                         }
                  }]
               }
            }
         };

         clearColumnScroll.saveOptions(cfg);
         clearColumnScroll._afterMount(cfg);

         assert.equal(clearColumnScroll._contentSize, 500);
         assert.equal(clearColumnScroll._contentContainerSize, 250);
         assert.deepEqual(clearColumnScroll._shadowState, 'end');
         assert.deepEqual(clearColumnScroll._fixedColumnsWidth, 100);

         clearColumnScroll._children.content = {
            getElementsByClassName: () => {
               return [{
                  scrollWidth: 200,
                  offsetWidth: 100,
                  getBoundingClientRect: () => {
                     return {
                        left: 20
                     }
                  },
                  querySelector: function () {
                     return {
                        getBoundingClientRect: () => {
                           return {
                              left: 44
                           }
                        },
                        offsetWidth: 50
                     };
                  }
               }]
            }
         };
         clearColumnScroll._afterUpdate({...cfg, columns: [{}, {}]});

         assert.equal(clearColumnScroll._contentSize, 200);
         assert.equal(clearColumnScroll._contentContainerSize, 100);
         assert.deepEqual(clearColumnScroll._shadowState, 'end');
         assert.deepEqual(clearColumnScroll._fixedColumnsWidth,  74);

         clearColumnScroll._children.content = {
            offsetTop: 0,
            getElementsByClassName: (className) => {
               if (className === 'controls-Grid__header') {
                  return [
                     {
                        childNodes: [
                           {
                              offsetHeight: 50,
                              offsetTop: 0
                           },
                           {
                              offsetHeight: 50,
                              offsetTop: 0
                           },
                        ]
                     }
                  ];
               } else if (className === 'controls-Grid__results') {
                  return [
                     {
                        childNodes: [
                           {
                              offsetHeight: 50,
                           },
                           {
                              offsetHeight: 50,
                           },
                        ]
                     }
                  ];
               } else {
                  return [{
                     scrollWidth: 500,
                     offsetWidth: 250,
                     getBoundingClientRect: () => {
                        return {
                           left: 20
                        }
                     },
                     querySelector:

                         function () {
                            return {
                               getBoundingClientRect: () => {
                                  return {
                                     left: 44
                                  }
                               },
                               offsetWidth: 76
                            };
                         }
                  }]
               }
            },
         }
         clearColumnScroll._setOffsetForHScroll();

         assert.equal(clearColumnScroll._offsetForHScroll, 50);
         assert.equal(clearColumnScroll._leftOffsetForHScroll, 74);

         clearColumnScroll._options.multiSelectVisibility = 'hidden';
         clearColumnScroll._afterUpdate({...cfg, multiSelectVisibility: 'visible'});

         assert.equal(clearColumnScroll._offsetForHScroll, 50);
         assert.equal(clearColumnScroll._leftOffsetForHScroll, 100);
         assert.equal(clearColumnScroll._contentSize, 500);
         assert.equal(clearColumnScroll._contentSizeForHScroll, 400);

         assert.isTrue(clearColumnScroll._isColumnScrollVisible());

         clearColumnScroll._afterUpdate({...cfg, root: '123'});
         assert.isFalse(clearColumnScroll._isColumnScrollVisible());

      });

      it('no sticky columns', function() {
         let clearColumnScroll = new ColumnScroll({...cfg, stickyColumnsCount: 0});

         clearColumnScroll._children = {
            contentStyle: {
               innerHTML: ''
            },
            content: {
               getElementsByClassName: () => {
                  return [{
                     scrollWidth: 500,
                     offsetWidth: 250,
                     getBoundingClientRect: () => {
                        return {
                           left: 20
                        }
                     },
                     querySelector:

                         function () {
                            return {
                               getBoundingClientRect: () => {
                                  return {
                                     left: 44
                                  }
                               },
                               offsetWidth: 76
                            };
                         }
                  }]
               }
            }
         };
         clearColumnScroll.saveOptions({...cfg, stickyColumnsCount: undefined});
         clearColumnScroll._afterMount({...cfg, stickyColumnsCount: undefined});
         assert.equal(clearColumnScroll._contentSize, 500);
         assert.equal(clearColumnScroll._contentContainerSize, 250);
         assert.deepEqual(clearColumnScroll._shadowState, 'end');
         assert.deepEqual(clearColumnScroll._fixedColumnsWidth, 0);
      });
      it('empty grid', function() {
         let clearColumnScroll = new ColumnScroll({...cfg, stickyColumnsCount: 0});

         clearColumnScroll._children = {
            contentStyle: {
               innerHTML: ''
            },
            content: {
               getElementsByClassName: () => {
                  return [{
                     scrollWidth: 250,
                     offsetWidth: 250,
                     getBoundingClientRect: () => {
                        return {
                           left: 20
                        }
                     },
                     querySelector:

                        function () {
                           return null;
                        }
                  }]
               }
            }
         };
         clearColumnScroll.saveOptions({...cfg, stickyColumnsCount: undefined});
         clearColumnScroll._afterMount({...cfg, stickyColumnsCount: undefined});
         assert.equal(clearColumnScroll._contentSize, 250);
         assert.equal(clearColumnScroll._contentContainerSize, 250);
         assert.deepEqual(clearColumnScroll._shadowState, '');
         assert.deepEqual(clearColumnScroll._fixedColumnsWidth, 0);
      });


      it('_isColumnScrollVisible', function() {

         assert.isTrue(columnScroll._isColumnScrollVisible());
         columnScroll._options.listModel.getItems = () => ({
            getCount: () => 0
         });
         assert.isFalse(columnScroll._isColumnScrollVisible());
      });
      it('_calculateShadowStyles', function() {
         let cont = columnScroll._container;
         columnScroll._container = {
            getElementsByClassName: function(className) {
               if (className === 'controls-BaseControl__emptyTemplate') {
                  return [];
               }
            }
         };
         assert.equal(columnScroll._calculateShadowStyles('start'), '');
         assert.equal(columnScroll._calculateShadowStyles('end'), '');

         columnScroll._container = {
            getElementsByClassName: function(className) {
               if (className === 'controls-BaseControl__emptyTemplate') {
                  return [{offsetTop: 60}];
               }
            }
         };
         assert.equal(columnScroll._calculateShadowStyles('start'), 'height: 60px;');
         assert.equal(columnScroll._calculateShadowStyles('end'), 'height: 60px;');
         columnScroll._container = cont;
      });
      it('_calculateShadowClasses', function() {
         assert.equal(columnScroll._calculateShadowClasses('start'),
            'controls-ColumnScroll__shadow controls-ColumnScroll__shadow-start controls-ColumnScroll__shadow_invisible');
         assert.equal(columnScroll._calculateShadowClasses('end'),
            'controls-ColumnScroll__shadow controls-ColumnScroll__shadow-end');
      });
      it('_resizeHandler', function() {
         var
            innerHTML,
            changesInnerHTML = [],
            resultChangesInnerHTML = [
               '.controls-ColumnScroll__transform-1234567890 .controls-Grid__cell_transform { transform: translateX(-50px); }',
               '.controls-ColumnScroll__transform-1234567890 .controls-Grid__cell_transform { transform: translateX(-0px); }',
               '.controls-ColumnScroll__transform-1234567890 .controls-Grid__cell_transform { transform: translateX(-50px); }'
            ];
         columnScroll._children = {
            contentStyle: {},
            content: {
               getElementsByClassName: () => {
                  return [{
                     scrollWidth: 450,
                     offsetWidth: 200,
                     getBoundingClientRect: () => {
                        return {
                           left: 20
                        }
                     },
                     querySelector: function () {
                        return {
                           getBoundingClientRect: () => {
                              return {
                                 left: 44
                              }
                           },
                           offsetWidth: 76
                        };
                     }
                  }]
               }
            }
         };
         Object.defineProperty(columnScroll._children.contentStyle, 'innerHTML', {
            set: function(newValue) {
               changesInnerHTML.push(newValue);
               innerHTML = newValue;
            },
            get: function() {
               return innerHTML;
            }
         });
         columnScroll._positionChangedHandler({}, 50);
         columnScroll._resizeHandler();
         assert.equal(450, columnScroll._contentSize);
         assert.equal(200, columnScroll._contentContainerSize);
         assert.deepEqual('startend', columnScroll._shadowState);
         assert.deepEqual(100, columnScroll._fixedColumnsWidth);
         assert.deepEqual(resultChangesInnerHTML, changesInnerHTML);
      });
      it('_positionChangedHandler', function() {
         // Scroll to 100px
         columnScroll._container = {
            getElementsByClassName: function(className) {
               if (className === 'controls-BaseControl__emptyTemplate') {
                  return [];
               }
            }
         };
         columnScroll._positionChangedHandler({}, 100);
         assert.equal(columnScroll._scrollPosition, 100);
         assert.deepEqual(columnScroll._shadowState, 'startend');
         assert.equal(columnScroll._calculateShadowStyles('start'), 'left: 100px;');
         assert.equal(columnScroll._calculateShadowStyles('end'), '');
         assert.equal(columnScroll._calculateShadowClasses('start'),
            'controls-ColumnScroll__shadow controls-ColumnScroll__shadow-start');
         assert.equal(columnScroll._calculateShadowClasses('end'),
            'controls-ColumnScroll__shadow controls-ColumnScroll__shadow-end');
         assert.equal(columnScroll._children.contentStyle.innerHTML, '.controls-ColumnScroll__transform-1234567890' +
            ' .controls-Grid__cell_transform { transform: translateX(-100px); }');

         // Scroll to 200px (to the end of content)
         columnScroll._positionChangedHandler({}, 250);
         assert.equal(columnScroll._scrollPosition, 250);
         assert.deepEqual(columnScroll._shadowState, 'start');
         assert.equal(columnScroll._calculateShadowStyles('start'), 'left: 100px;');
         assert.equal(columnScroll._calculateShadowStyles('end'), '');
         assert.equal(columnScroll._calculateShadowClasses('start'),
            'controls-ColumnScroll__shadow controls-ColumnScroll__shadow-start');
         assert.equal(columnScroll._calculateShadowClasses('end'),
            'controls-ColumnScroll__shadow controls-ColumnScroll__shadow-end controls-ColumnScroll__shadow_invisible');
         assert.equal(columnScroll._children.contentStyle.innerHTML, '.controls-ColumnScroll__transform-1234567890' +
            ' .controls-Grid__cell_transform { transform: translateX(-250px); }');
      });

      it('_calcPositionByWheel', function() {
         var newPos;
         newPos = columnScroll._calcPositionByWheel(100, 200, 50);
         assert.equal(150, newPos);
         newPos = columnScroll._calcPositionByWheel(20, 200, -50);
         assert.equal(0, newPos);
         newPos = columnScroll._calcPositionByWheel(180, 200, 50);
         assert.equal(200, newPos);
      });

      it('_calcWheelDelta', function() {
         var delta;
         delta = columnScroll._calcWheelDelta(false, 200);
         assert.equal(200, delta);
         delta = columnScroll._calcWheelDelta(true, 2);
         assert.equal(100, delta);
         delta = columnScroll._calcWheelDelta(true, -2);
         assert.equal(-100, delta);
      });

      it('setOffsetForHScroll', function () {

         columnScroll._children = {
            content: {
               offsetTop: 0,
               getElementsByClassName: function (className) {
                  if (className === 'controls-Grid__header') {
                     return [];
                  } else if (className === 'controls-Grid__results') {
                     return [];
                  }
               }
            }
         };

         columnScroll._setOffsetForHScroll();
         assert.equal(columnScroll._leftOffsetForHScroll, 0);
         assert.equal(columnScroll._offsetForHScroll, 0);

         columnScroll._children.content.getElementsByClassName = function (className) {
            if (className === 'controls-Grid__header') {
               return [
                  {
                     childNodes: [
                        {
                           offsetHeight: 50,
                           offsetTop: 0,
                        },
                        {
                           offsetHeight: 50,
                           offsetTop: 0,
                        },
                     ]
                  }
               ];
            } else if (className === 'controls-Grid__results') {
               return [
                  {
                     childNodes: [
                        {
                           offsetHeight: 50,
                        },
                        {
                           offsetHeight: 50,
                        },
                     ]
                  }
               ];
            }
         }
         columnScroll._setOffsetForHScroll();
         assert.equal(columnScroll._leftOffsetForHScroll, 100);
         assert.equal(columnScroll._offsetForHScroll, 50);

         columnScroll._options.listModel.getResultsPosition = () => 'top';
         columnScroll._setOffsetForHScroll();

         assert.equal(columnScroll._offsetForHScroll, 100);

         columnScroll._leftOffsetForHScroll = 0;
         columnScroll._offsetForHScroll = 0;

         columnScroll._isFullGridSupport = false;
         columnScroll._setOffsetForHScroll();
         assert.equal(columnScroll._leftOffsetForHScroll, 0);
         assert.equal(columnScroll._offsetForHScroll, 0);


      });
   });
});
