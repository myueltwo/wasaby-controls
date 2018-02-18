define('SBIS3.CONTROLS/Action/List/Save', [
    'SBIS3.CONTROLS/Action/Save',
    'SBIS3.CONTROLS/Action/List/Mixin/ListMixin',
    'Core/helpers/fast-control-helpers',
    'Core/Deferred',
    'WS.Data/Chain',
    'Core/core-merge',
    'Core/core-instance',
    'Core/core-clone',
    'WS.Data/Collection/RecordSet',
    'Deprecated/Controls/DialogSelector/DialogSelector',
    'WS.Data/Query/Query',
    'WS.Data/Entity/Record',
    'Core/moduleStubs'
], function (Save, ListMixin, fcHelpers, Deferred, Chain, cMerge, cInstance, coreClone, RecordSet, Dialog, Query, Record, moduleStubs) {
    var MAX_RECORDS_COUNT = 20000;

    /**
     * Класс, описывающий действие сохранения данных.
     * @class SBIS3.CONTROLS/Action/List/Save
     * @extends SBIS3.CONTROLS/Action/Save
     * @mixes SBIS3.CONTROLS/Action/List/Mixin/ListMixin
     * @public
     * @author Сухоручкин А.С.
     */
    var SaveList = Save.extend([ListMixin], /** @lends SBIS3.CONTROLS/Action/List/Save.prototype */{
        $protected: {
            _options: {
               /**
                * @cfg {SBIS3.CONTROLS.ISaveStrategy) Стратегия сохранения данных.
                * @see SBIS3.CONTROLS/Action/Save/SaveStrategy/ISaveStrategy
                * @see SBIS3.CONTROLS/Action/Save/SaveStrategy/Base
                * @see SBIS3.CONTROLS/Action/Save/SaveStrategy/Sbis
                */
                saveStrategy: 'SBIS3.CONTROLS/Action/Save/SaveStrategy/Sbis',
                /**
                * @cfg {Array} Колонки, которые будут сохраняться.
                **/
                columns: undefined,
                /**
                * @cfg {String} Имя сохраняемого файла.
                **/
                fileName: '',
                /**
                * @cfg {String} Имя файла с XSL-преобразованием.
                **/
                xsl: undefined
            }
        },

        _doExecute: function(meta) {
            var
                dataForSave,
                self = this;
            this._prepareMeta(meta).addCallback(function(meta) {
               dataForSave = self._getDataForSave(meta);
               dataForSave = dataForSave instanceof Deferred ? dataForSave : Deferred.success(dataForSave);
               dataForSave.addCallback(function(data) {
                  if (cInstance.instanceOfModule(data, 'WS.Data/Collection/RecordSet')) {
                     meta.recordSet = data;
                  } else if (cInstance.instanceOfModule(data, 'WS.Data/Query/Query')) {
                     meta.query = data;
                  }
                  self.getSaveStrategy().addCallback(function(strategy) {
                     strategy.saveAs(meta);
                     return strategy;
                  });
               });
            });
        },

        _getDataForSave: function(meta) {
            var result;
            if (meta.recordSet) {
                result = meta.recordSet;
            } else if (meta.query) {
                result = this._getDataFromQuery(meta.dataSource, meta.query, meta.serverSideExport);
            } else {
                result = this._computeDataForSave(meta);
            }
            return result;
        },

        _computeDataForSave: function(meta) {
            var
               result,
               selectedIds,
               linkedObject = this.getLinkedObject(),
               selection = linkedObject.getSelection();
            if (selection && selection.marked) {
               result = this._getDataFromSelection(meta, selection);
            } else {
               selectedIds = linkedObject.getSelectedKeys();
               if (selectedIds.length) {
                   result = this._getDataFromSelectedIds(meta, selectedIds);
               } else {
                   result = this._getDataFromSelector(meta);
               }
            }
            return result;
        },

        _getDataFromSelectedIds: function(meta, selectedIds) {
           var
              query,
              result;
           if (meta.alwaysLoadData) {
              query = this._createQuery({
                 selectedIds: selectedIds.map(function(key) { return String(key); }),
                 columns: this._formatColumnsForFilter(meta.columns)
              });
              result = this._getDataFromQuery(meta.dataSource, query, meta.serverSideExport);
           } else {
              result = this._getSelectedRecordSet();
           }
           return result;
        },

        _getDataFromSelection: function(meta, selection) {
           var query = this._createQuery({
                 selection: Record.fromObject(selection, meta.dataSource.getAdapter()),
                 columns: this._formatColumnsForFilter(meta.columns)
              });
           return this._getDataFromQuery(meta.dataSource, query, meta.serverSideExport);
        },

        _getDataFromSelector: function(meta) {
            var linkedObject = this.getLinkedObject();
            return this._showAmountSelector(this._getTitleForSelector(meta.endpoint), linkedObject.getItems().getCount()).addCallback(function(limit) {
                var
                   query,
                   filter = this._getOpenedPath(meta.parentProperty);
                filter.columns = this._formatColumnsForFilter(meta.columns);
                query = this._createQuery(filter, limit);
                return this._getDataFromQuery(meta.dataSource, query, meta.serverSideExport);
            }.bind(this));
        },

       _getOpenedPath: function(parentProperty) {
          var
             openedPath, filter = {},
             linkedObject = this.getLinkedObject();
          if (parentProperty) {
             filter[parentProperty] = filter[parentProperty] === undefined ? [linkedObject.getCurrentRoot()] : filter[parentProperty];
             filter[parentProperty] = filter[parentProperty] instanceof Array ? filter[parentProperty] : [filter[parentProperty]];
             openedPath = linkedObject.getOpenedPath();
             for (var key in openedPath) {
                if (openedPath.hasOwnProperty(key)) {
                   if (filter[parentProperty].indexOf(key) === -1) {
                      filter[parentProperty].push(key);
                   }
                }
             }
          }

          return filter;
       },

        _createQuery: function(filter, limit) {
           var
              query = new Query(),
              linkedObject = this.getLinkedObject(),
              viewFilter = coreClone(linkedObject.getFilter());

           query.where(cMerge(viewFilter, filter))
                .orderBy(linkedObject.getSorting())
                .offset(linkedObject.getOffset())
                .limit(limit || MAX_RECORDS_COUNT);

           return query;
        },

        _formatColumnsForFilter: function(columns) {
           var result = [];
           columns.forEach(function(column) {
              if (column.field) {
                 result.push(column.field);
              }
           });
           return result;
        },

        _getDataFromQuery: function(dataSource, query, serverSideExport) {
            return serverSideExport ? query : this._loadData(dataSource, query);
        },

        _getTitleForSelector: function (type) {
            return type ? rk('Что сохранить в') + ' ' + type : rk('Что напечатать');
        },

        _getSelectedRecordSet: function() {
            var
                linkedObject = this.getLinkedObject(),
                items = linkedObject.getItems(),
                selectedRecordSet = new RecordSet({
                    adapter: items ? items.getAdapter() : 'adapter.json'
                });
            selectedRecordSet.assign(linkedObject.getSelectedItems() || []);
            return selectedRecordSet;
        },

        _showAmountSelector: function(title, defaultCount) {
            var result = new Deferred();
            new Dialog ({
                opener : this,
                template: 'SBIS3.CONTROLS/OperationsPanel/Print/MassAmountSelector',
                caption : title,
                cssClassName: 'controls-MassAmountSelector',
                handlers: {
                    onBeforeShow: function() {
                        this.getLinkedContext().setValue('NumOfRecords', defaultCount);
                    },
                    onChange: function(event, count) {
                        result.callback(count);
                    }
                }
            });
            return result;
        },

        _prepareMeta: function(meta) {
            meta = meta || {};
            var
                serverSideExport = true,
                linkedObject = this.getLinkedObject(),
                options = ['columns', 'fileName', 'xsl'];

            options.forEach(function (name) {
                meta[name] = meta[name] || this._options[name];
            }, this);
            meta.dataSource = meta.dataSource || this.getDataSource();
            if (meta.xsl || !meta.endpoint) {
                serverSideExport = false;
            }
           //Для IOS всегда будем выгружать через сервер.
            meta.serverSideExport = serverSideExport;
            meta.pageOrientation = meta.endpoint === 'PDF' ? meta.pageOrientation || 1 : undefined;
            if (cInstance.instanceOfMixin(linkedObject, 'SBIS3.CONTROLS/Mixins/TreeMixin')) {
                meta.parentProperty = linkedObject.getParentProperty();
            }

            return this._prepareColumns(meta).addCallback(function(columns) {
               meta.columns = columns || linkedObject.getColumns();
               return meta;
            });
        },

        _prepareColumns: function(meta) {
           var
              editorResult,
              result = new Deferred();
           editorResult = this.sendCommand('showColumnsEditor', {
              columnsConfig: meta.columnsConfig,
              editorOptions: meta.editorOptions
           });
           if (editorResult instanceof Deferred) {
              editorResult.addCallback(function (config) {
                 if (config) {
                    result.callback(config.resultColumns);
                 } else {
                    //Сюда мы попадаем если команда showColumnsEditor была обработана, но диалог закрыли.
                    //В таком случае нам не надо продолжать сохранение.
                    result.errback();
                 }
              });
           } else {
              //Сюда мы попадаем если команда showColumnsEditor не была обработана.
              //В таком случае будем использовать колонки, переданные в метод execute экшена.
              result.callback(meta.columns);
           }
           return result;
        },

        _loadData: function(dataSource, query) {
            var result = new Deferred();

            fcHelpers.toggleIndicator(true);
            dataSource.query(query).addCallback(function (recordSet) {
               result.callback(recordSet.getAll());
            }).addBoth(function() {
               fcHelpers.toggleIndicator(false);
            });

           return result;
        }
    });

    return SaveList;

});