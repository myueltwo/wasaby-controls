/**
 * Created by kraynovdo on 01.11.2017.
 */
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import dButtonsTemplate = require('wml!Controls/_paging/Paging/DigitButtons');
import {SyntheticEvent} from 'Vdom/Vdom';

export interface IDigitButtonsOptions extends IControlOptions {
    count: number;
    selectedKey?: number;
}

const SUR_STANDARD_ELEMENTS_STEP = 3;
const SUR_NUMBERS_ELEMENTS_STEP = 1;

type DigitElem = number | '...';

interface ISurroundElements {
    first: number;
    last: number;
}

class DigitButtons extends Control<IDigitButtonsOptions> {
    protected _template: TemplateFunction = dButtonsTemplate;
    _digits: DigitElem[] | null = null;

    protected _beforeMount(newOptions: IDigitButtonsOptions): void {
        this._digits = DigitButtons._getDrawnDigits(newOptions.count, newOptions.selectedKey, (newOptions.mode === 'numbers' ? 'numbers' : 'standard'));
    }

    protected _beforeUpdate(newOptions: IDigitButtonsOptions): void {
        if (newOptions.count !== this._options.count || newOptions.selectedKey !== this._options.selectedKey) {
            this._digits = DigitButtons._getDrawnDigits(newOptions.count, newOptions.selectedKey, (newOptions.mode === 'numbers' ? 'numbers' : 'standard'));
        }
    }

    protected _digitClick(e: SyntheticEvent<Event>, digit: number): void {
        this._notify('onDigitClick', [digit]);
    }

    static _theme: string[] = ['Controls/paging'];

    // получаем граничные цифры, окружающие выбранный элемент, по условия +-3 в обе стороны (4 5 6 [7] 8 9 10)
    private static _getSurroundElemens(digitsCount: number, currentDigit: number, mode: string = 'standard'): ISurroundElements {
        let firstElem: number;
        let lastElem: number;
        if (mode === 'standard') {
            firstElem = currentDigit - SUR_STANDARD_ELEMENTS_STEP;
            lastElem = currentDigit + SUR_STANDARD_ELEMENTS_STEP;
        } else {
            firstElem = currentDigit - SUR_NUMBERS_ELEMENTS_STEP;
            lastElem = currentDigit + SUR_NUMBERS_ELEMENTS_STEP;
        }
        if (mode !== 'standard') {
            if (currentDigit === 1) {
                lastElem++;
            }
            if (currentDigit === digitsCount) {
                firstElem--;
            }
        }
        if (firstElem < 1) {
            firstElem = 1;
        }
        if (lastElem > digitsCount) {
            lastElem = digitsCount;
        }
        return {
            first: firstElem,
            last: lastElem
        };
    }

    private static _getDrawnDigits(digitsCount: number, currentDigit: number, mode: string = 'standard'): DigitElem[] {
        const drawnDigits: DigitElem[] = [];
        let surElements: ISurroundElements;

        if (digitsCount) {

            surElements = DigitButtons._getSurroundElemens(digitsCount, currentDigit, mode);

            if (surElements.first > 1) {
                if (mode === 'standard') {
                    // если левая граничная цифра больше единицы, то единицу точно рисуем
                    drawnDigits.push(1);

                    // если левая граничная цифра больше 3, надо рисовать многоточие (1 ... 4 5 6 [7])
                    if (surElements.first > 3) {
                        drawnDigits.push('...');
                        // а если равно шагу, то надо рисовать предыдущий по правилу исключения,
                        // что многоточием не может заменяться одна цифра
                    } else if (surElements.first === 3) {
                        drawnDigits.push(2);
                    }
                } else {
                    if (surElements.first === 2) {
                        drawnDigits.push(1);
                    } else {
                        drawnDigits.push('...');
                    }
                }
            }

            // рисуем все граничные цифры
            for (let i = surElements.first; i <= surElements.last; i++) {
                drawnDigits.push(i);
            }

            // и рисуем правый блок аналогично левому, но в противоположную строну
            if (surElements.last < digitsCount) {
                if (mode === 'standard') {
                    if (surElements.last < digitsCount - 2) {
                        drawnDigits.push('...');
                    } else if (surElements.last < digitsCount - 1) {
                        drawnDigits.push(digitsCount - 1);
                    }

                    drawnDigits.push(digitsCount);
                } else {
                    if (surElements.last === digitsCount - 1) {
                        drawnDigits.push(digitsCount);
                    } else {
                        drawnDigits.push('...');
                    }
                }
            }
        }
        return drawnDigits;
    }
}

export default DigitButtons;
