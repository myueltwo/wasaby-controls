import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_validate/Controller');
import ValidateContainer from 'Controls/_validate/Container';
import ControllerClass from 'Controls/_validate/ControllerClass';

interface IValidateResult {
    [key: number]: boolean;
    hasErrors?: boolean;
}

/**
 * Контрол, регулирующий валидацию формы.
 * Валидация запускается при вызове метода {@link Controls/_validate/Controller#submit submit}.
 * @class Controls/_validate/Controller
 * @extends Core/Control
 * @control
 * @public
 * @demo Controls-demo/Input/Validate/FormController
 * @author Красильников А.С.
 */

class Form extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    private _validateController: ControllerClass = new ControllerClass();

    onValidateCreated(e: Event, control: ValidateContainer): void {
        this._validateController.addValidator(control);
    }

    onValidateDestroyed(e: Event, control: ValidateContainer): void {
        this._validateController.removeValidator(control);
    }

    submit(): Promise<IValidateResult | Error> {
        return this._validateController.submit();
    }

    setValidationResult(): void {
        return this._validateController.setValidationResult();
    }

    getValidationResult(): IValidateResult {
        return this._validateController.getValidationResult();
    }

    isValid(): boolean {
        return this._validateController.isValid();
    }

    protected _beforeUnmount(): void {
        this._validateController.destroy();
        this._validateController = null;
    }
}

export default Form;

/**
 * @name Controls/_validate/Controller#content
 * @cfg {Content} Содержимое, к которому добавлена ​​логика валидации.
 */

/**
 * Запускает валидацию.
 * @name Controls/_validate/Controller#submit
 * @function
 * @returns {Deferred}
 * @example
 * WML
 * <pre>
 * <Controls.validate:Controller name="formController">
 *    <ws:content>
 *       <Controls.validate:Container>
 *          <ws:validators>
 *             <ws:Function value="{{_value2}}" >Controls/validate:isRequired</ws:Function>
 *          </ws:validators>
 *          <ws:content>
 *             <Controls.input:Text bind:value="_value2"/>
 *          </ws:content>
 *       </Controls.validate:Container>
 *    </ws:content>
 * </Controls.validate:Controller>
 * <Controls.buttons:Button caption="Submit" on:click="_clickHandler()"
 * </pre>
 * JavaScript
 * <pre>
 *     Control.extend({
 *        ...
 *
 *        _clickHandler: function() {
 *           this._children.formController.submit();
 *        }
 *        ...
 *    });
 * </pre>
 */

/**
 * Возвращает значение, указывающее, прошла ли проверка валидации содержимого успешно.
 * @name Controls/_validate/Controller#isValid
 * @function
 * @returns {Boolean}
 */
