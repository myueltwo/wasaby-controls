import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/SourceChanger/FromEmpty/FromEmpty"
import {Memory} from "Types/source"
import {getCountriesStats, changeSourceData} from "../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

const { data2: data } = changeSourceData();

class demoSource extends Memory {
    queryNumber: number = 0;
    pending: Promise<any>;
    private query(query) {
        const self = this;
        const args = arguments;
        return this.pending.then(() => {
            return super.query.apply(this, args).addCallback((items) => {
                const rawData = items.getRawData();
                rawData.items = data.filter((cur) => cur.load === this.queryNumber);
                rawData.meta.more = this.queryNumber < 2;
                rawData.meta.total = rawData.items.length;
                items.setRawData(rawData);
                this.queryNumber++;
                return items;
            });
        });
    }
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _viewSource2: Memory;
    private _columns = getCountriesStats().getColumnsForLoad();
    private _resolve = null;

    protected _beforeMount() {
        const self = this;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: []
        });
        this._navigation = {
            source: 'page',
            view: 'maxCount',
            sourceConfig: {
                pageSize: 10,
                page: 0,
            },
            viewConfig: {
                maxCountValue: 3
            }
        };
        this._viewSource2 = new demoSource({
            keyProperty: 'id',
            data: data,
        });
    }
    private _onPen() {
        const self = this;
        this._resolve();
        this._viewSource2.pending = new Promise((res) => { self._resolve = res; });
    }
    private _onChangeSource() {
        const self = this;
        this._viewSource2.pending = new Promise((res) => { self._resolve = res; });
        this._viewSource2.queryNumber = 0;
        this._viewSource = this._viewSource2;
    }

}
