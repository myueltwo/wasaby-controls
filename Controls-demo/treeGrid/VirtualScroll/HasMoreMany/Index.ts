import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/VirtualScroll/HasMoreMany/HasMoreMany';
import {Memory} from 'Types/source';
import {VirtualScrollHasMore} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = VirtualScrollHasMore.getColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: VirtualScrollHasMore.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
