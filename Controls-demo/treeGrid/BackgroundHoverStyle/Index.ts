import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/BackgroundHoverStyle/BackgroundHoverStyle';
import {Memory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown[] = Gadgets.getColumnsForFlat();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/treeGrid/BackgroundHoverStyle/BackgroundHoverStyle'
    ];
}
