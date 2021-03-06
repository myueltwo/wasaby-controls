import {Control, IControlOptions} from 'UI/Base';
import {ISliderOptions} from './interface/ISlider';
import {default as Utils} from './Utils';
import {SyntheticEvent} from 'Vdom/Vdom';
import {descriptor as EntityDescriptor} from 'Types/entity';
import {constants} from 'Env/Env';

export interface ISliderBaseOptions extends IControlOptions, ISliderOptions {
}

const MOBILE_TOOLTIP_HIDE_DELAY: number = 3000;

class SliderBase extends Control<ISliderBaseOptions> {
    private _tooltipPosition: number | null = null;
    private _hideTooltipTimerId: number;
    protected _tooltipValue: string | null = null;
    protected _isDrag: boolean = false;

    _getValue(event: SyntheticEvent<MouseEvent | TouchEvent>): number {
        const target = this._options.direction === 'vertical' ? Utils.getNativeEventPageY(event) :
            Utils.getNativeEventPageX(event);
        const box = this._children.area.getBoundingClientRect();
        const ratio = this._options.direction === 'vertical' ?
            Utils.getRatio(target, box.top + window.pageYOffset, box.height) :
            Utils.getRatio(target, box.left + window.pageXOffset, box.width);
        return Utils.calcValue(this._options.minValue, this._options.maxValue, ratio, this._options.precision);
    }

    _mouseMoveAndTouchMoveHandler(event: SyntheticEvent<MouseEvent>): void {
        if (!this._options.readOnly) {
            this._tooltipPosition = this._getValue(event);
            this._tooltipValue = this._options.tooltipFormatter ? this._options.tooltipFormatter(this._tooltipPosition)
                : this._tooltipPosition;

            // На мобилках события ухода мыши не стреляют (если не ткнуть пальцем в какую-то область)
            // В этом случае, по стандарту, скрываю тултип через 3 секунды.
            if (constants.browser.isMobileIOS || constants.browser.isMobileAndroid) {
                if (this._hideTooltipTimerId) {
                    clearTimeout(this._hideTooltipTimerId);
                }
                this._hideTooltipTimerId = setTimeout(() => {
                    this._hideTooltipTimerId = null;
                    this._mouseLeaveAndTouchEndHandler();
                }, MOBILE_TOOLTIP_HIDE_DELAY);
            }
        }
    }

    _mouseLeaveAndTouchEndHandler(event?: SyntheticEvent<MouseEvent>): void {
        if (!this._options.readOnly) {
            this._tooltipValue = null;
            this._tooltipPosition = null;
        }
    }

    protected _onDocumentDragEnd(event: SyntheticEvent<MouseEvent>): void {
        if (!this._options.readOnly) {
            this._isDrag = false;
        }
    }

    protected _onDragStartHandler(e: SyntheticEvent<Event>, dragObject): void {
        this._isDrag = true;
        this._onDragNDropHandler(e, dragObject);
    }

    protected _onDragNDropHandler(e: SyntheticEvent<Event>, dragObject): void {}

    static getDefaultOptions() {
        return {
            size: 'm',
            direction: 'horizontal',
            borderVisible: false,
            tooltipVisible: true,
            minValue: undefined,
            maxValue: undefined,
            scaleStep: undefined,
            precision: 0
        };

    }

    static getOptionTypes() {
        return {
            size: EntityDescriptor(String).oneOf([
                's',
                'm'
            ]),
            direction: EntityDescriptor(String).oneOf([
                'horizontal',
                'vertical'
            ]),
            borderVisible: EntityDescriptor(Boolean),
            tooltipVisible: EntityDescriptor(Boolean),
            minValue: EntityDescriptor(Number).required,
            maxValue: EntityDescriptor(Number).required,
            scaleStep: EntityDescriptor(Number),
            precision: EntityDescriptor(Number)
        };
    }
}

export default SliderBase;
