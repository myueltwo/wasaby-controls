import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Number/FractionSize/FractionSize');

class FractionSize extends Control<IControlOptions> {
    protected _value = '12345.67890';

    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static _theme: string[] = ['Controls/Classes'];
}

export default FractionSize;
