import BaseViewModel from '../BaseViewModel';
import {IInputType, ISplitValue} from '../resources/Types';
import {textBySplitValue, hasSelectionChanged} from '../resources/Util';
import {IText} from 'Controls/decorator';

interface IViewModelOptions {
    maxLength?: number;
    constraint?: string;
}

class ViewModel extends BaseViewModel<string, IViewModelOptions> {
    protected _convertToDisplayValue(value: string | null): string {
        return value === null ? '' : value;
    }

    protected _convertToValue(displayValue: string): string {
        return displayValue;
    }

    handleInput(splitValue: ISplitValue, inputType: IInputType): boolean {
        if (inputType === 'insert') {
            if (this._options.constraint) {
                ViewModel._limitChars(splitValue, this._options.constraint);
            }
            if (this._options.maxLength) {
                ViewModel._limitLength(splitValue, this._options.maxLength);
            }
        }

        const text: IText = textBySplitValue(splitValue);
        const displayValueChanged: boolean = this._displayValue !== text.value;
        const selectionChanged: boolean = hasSelectionChanged(this._selection, text.carriagePosition);

        if (displayValueChanged) {
            this._setDisplayValue(text.value);
        }
        if (selectionChanged) {
            this._setSelection(text.carriagePosition);
        }
        if (displayValueChanged || selectionChanged) {
            this._nextVersion();
        }

        return displayValueChanged;
    }

    private static _limitChars(splitValue: ISplitValue, constraint: string): void {
        const constraintRegExp: RegExp = new RegExp(constraint, 'g');
        const match: RegExpMatchArray | null = splitValue.insert.match(constraintRegExp);

        splitValue.insert = match ? match.join('') : '';
    }

    private static _limitLength(splitValue: ISplitValue, maxLength: number): void {
        const maxInsertionLength: number = maxLength - splitValue.before.length - splitValue.after.length;
        splitValue.insert = splitValue.insert.substring(0, maxInsertionLength);
    }
}

export default ViewModel;
