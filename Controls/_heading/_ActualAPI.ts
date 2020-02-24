import {IBackOptions} from './Back';

export function counterSize(size: 's' | 'm' | 'l', fontSize: string): string {
    if (fontSize) {
        return fontSize;
    } else {
        const fontSizesTable = {
            s: 'm',
            m: 'l',
            l: '3xl'
        };
        const result: string = fontSizesTable[size];
        return result || 'l';
    }
}

export function counterStyle(style: 'primary' | 'secondary' | 'disabled', fontColorStyle: string): string {
    if (fontColorStyle) {
        return fontColorStyle;
    } else {
        const fontStylesTable = {
            primary: 'primary',
            secondary: 'secondary',
            disabled: 'unaccented'
        };
        const result: string = fontStylesTable[style];
        return result || 'primary';
    }
}

export function backSize(options: IBackOptions): { fontSize: string, iconSize: string } {
    if (options.style) {
        return {fontSize: options.size, iconSize: options.size};
    } else {
        return {fontSize: options.fontSize, iconSize: options.iconSize};
    }
}

export function backStyleOptions(style: 'primary' | 'secondary'): { fontColorStyle: string, iconStyle: string } {
    if (style === 'secondary') {
        return {
            fontColorStyle: 'secondary', iconStyle: 'primary'
        };
    } else {
        return {
            fontColorStyle: 'primary', iconStyle: 'secondary'
        };
    }
}

export function backStyle(options: IBackOptions): { fontColorStyle: string, iconStyle: string } {
    if (options.style) {
        return backStyleOptions(options.style);
    } else {
        return  {
            fontColorStyle: options.fontColorStyle,
            iconStyle: options.iconStyle
        };
    }
}
