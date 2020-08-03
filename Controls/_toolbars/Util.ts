import {IControlOptions, TemplateFunction} from 'UI/Base';
import {ActualApi} from 'Controls/buttons';
import {ButtonTemplate, cssStyleGeneration, IButtonOptions, defaultHeight, defaultFontColorStyle, getDefaultOptions} from 'Controls/buttons';
import {ICrudPlus} from "Types/source";
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {CrudWrapper} from 'Controls/dataSource';

type TItem = Record;
type TItems = RecordSet<TItem>;

export function getButtonTemplate(): TemplateFunction {
    return ButtonTemplate;
}

export function loadItems(source: ICrudPlus): Promise<TItems> {
    const crudWrapper = new CrudWrapper({source});
    return crudWrapper.query({});
}

export function hasSourceChanged(newSource?: ICrudPlus, oldSource?: ICrudPlus): boolean {
    const currentSource = oldSource;
    return newSource && currentSource !== newSource;
}

export function getButtonTemplateOptionsByItem(item: TItem, toolbarOptions: IControlOptions = {}): IButtonOptions {
    const icon = item.get('icon');
    const style = item.get('buttonStyle');
    const viewMode = item.get('viewMode');

    // todo: https://online.sbis.ru/opendoc.html?guid=244a5058-47c1-4896-a494-318ba2422497
    const inlineHeight = viewMode === 'functionalButton' ? 'default' : ActualApi.actualHeight('m', undefined, viewMode, false);
    const iconSize = viewMode === 'functionalButton' ? 's' : item.get('iconSize') || toolbarOptions.iconSize;

    const iconStyle = item.get('iconStyle');
    const transparent = item.get('buttonTransparent');
    const caption = item.get('caption');
    const captionPosition = item.get('captionPosition');
    const readOnly = item.get('readOnly') || toolbarOptions.readOnly;
    const fontColorStyle = item.get('fontColorStyle');
    const contrastBackground = item.get('contrastBackground');
    const cfg: IButtonOptions = {};
    cfg._hoverIcon = true;
    cssStyleGeneration.call(cfg, {
        inlineHeight,
        icon,
        style,
        viewMode,
        iconStyle,
        iconSize,
        transparent,
        caption,
        captionPosition,
        readOnly,
        fontColorStyle,
        contrastBackground
    });
    cfg.readOnly = readOnly;
    return cfg;
}

export function getSimpleButtonTemplateOptionsByItem(item: TItem, toolbarOptions: IControlOptions = {}): IButtonOptions {
    const cfg: IButtonOptions = {};
    const defaultOptions = getDefaultOptions();
    const icon = item.get('icon');
    const caption = item.get('caption');
    const viewMode = item.get('viewMode') || defaultOptions.viewMode;
    const readOnly = item.get('readOnly') || toolbarOptions.readOnly;
    const buttonStyle = item.get('buttonStyle') || defaultOptions.buttonStyle;
    const iconStyle = item.get('iconStyle') || defaultOptions.iconStyle;

    cfg._hoverIcon = true;
    cfg._buttonStyle = readOnly ? 'readonly' : buttonStyle;
    cfg._contrastBackground = item.get('contrastBackground');
    cfg._viewMode = viewMode;
    cfg._height = item.get('inlineHeight') || defaultHeight(viewMode);
    cfg._fontColorStyle = item.get('fontColorStyle') || defaultFontColorStyle(viewMode);
    cfg._fontSize = item.get('fontSize') || defaultOptions.fontSize;
    cfg._hasIcon = !!icon;
    cfg._caption = caption;
    cfg._stringCaption = typeof caption === 'string';
    cfg._captionPosition = item.get('captionPosition') || defaultOptions.captionPosition;
    cfg._icon = icon;
    cfg._iconSize = item.get('iconSize') || 'm';
    cfg._iconStyle = readOnly ? 'readonly' : iconStyle;
    cfg.readOnly = readOnly;

    return cfg;
}

export function getTemplateByItem(item: TItem, options): TemplateFunction {
    const selfItemTemplate: TemplateFunction = item.get(options.itemTemplateProperty);

    if (selfItemTemplate) {
        return selfItemTemplate;
    }

    return options.itemTemplate;
}
