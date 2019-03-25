import TreeViewModel = require('Controls/_lists/Tree/TreeViewModel');
import SearchItemsUtil = require('Controls/_lists/resources/utils/SearchItemsUtil');

var
    SearchViewModel = TreeViewModel.extend({
        _prepareDisplay: function (items, cfg) {
            var
                filter = this.getDisplayFilter(this.prepareDisplayFilterData(), cfg);
            return SearchItemsUtil.getDefaultDisplaySearch(items, cfg, filter);
        },
        getDisplayFilter: function (data, cfg) {
            var
                filter = [];
            if (cfg.itemsFilterMethod) {
                filter.push(cfg.itemsFilterMethod);
            }
            return filter;
        }
    });

export = SearchViewModel;
