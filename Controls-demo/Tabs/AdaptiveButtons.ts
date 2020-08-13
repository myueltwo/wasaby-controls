import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import template = require('wml!Controls-demo/Tabs/AdaptiveButtons/AdaptiveButtons');

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;
    protected SelectedKey1: string = '1';
    protected _items: RecordSet | null = null;
    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: '1Fffffffffs',
                    align: 'left'
                },
                {
                    id: '2',
                    title: '22Fiffffffffffffffffffffles',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Filfffffffffffffffffffffffes',
                    align: 'left'
                },
                {
                    id: '4',
                    title: 'Filffffffffffffffffffffes',
                    align: 'left'
                },
                {
                    id: '5',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '6',
                    title: 'Fiffffffffffffffles',
                    align: 'left'
                },
                {
                    id: '7',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '8',
                    title: 'Fi4444les',
                    align: 'left'
                },
                {
                    id: '9',
                    title: 'Fi4444les  44444',
                    align: 'left'
                },
                {
                    id: '10',
                    title: 'Fi222les',
                    align: 'left'
                },
                {
                    id: '11',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '12',
                    title: 'Fi4444444444les',
                    align: 'left'
                },
                {
                    id: '13',
                    title: 'F 44444444iles',
                    align: 'left'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons'];
}
