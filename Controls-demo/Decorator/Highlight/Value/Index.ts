import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Highlight/Value/Value');

class Value extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Decorator/Highlight/Value/Value'];

    static _theme: string[] = ['Controls/Classes'];
}

export default Value;
