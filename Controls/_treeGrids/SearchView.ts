import {GridView} from 'Controls/grid';
import DefaultItemTpl = require('wml!Controls/_treeGrids/SearchView/Item');
import 'Controls/breadcrumbs';
import 'Controls/decorator';
import 'wml!Controls/_treeGrids/SearchView/SearchBreadCrumbsContent';

var
    SearchView = GridView.extend({
        _defaultItemTemplate: DefaultItemTpl,
        _onSearchItemClick: function (e) {
            e.stopPropagation();
        },
        _onSearchPathClick: function (e, item) {
            this._notify('itemClick', [item, e], {bubbling: true});
        },
        getDefaultOptions: function () {
            return {
                leftPadding: 'S'
            };
        }
    });

export = SearchView;
