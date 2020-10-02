import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/EditInPlace/Colspan/Colspan';
import * as ItemTemplate from 'wml!Controls-demo/treeGrid/EditInPlace/Colspan/resource/Item';
import {Memory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _itemTemplate: TemplateFunction = ItemTemplate;
    protected _viewSource: Memory;
    private _columns = Gadgets.getGridColumnsForFlat();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
