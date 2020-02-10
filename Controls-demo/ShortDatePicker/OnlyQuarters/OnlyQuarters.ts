import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/OnlyQuarters/OnlyQuarters");
import 'css!Controls-demo/Controls-demo';

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
}

export default DemoControl;
