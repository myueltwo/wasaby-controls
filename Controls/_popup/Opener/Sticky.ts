import BaseOpener, {IBaseOpenerOptions} from 'Controls/_popup/Opener/BaseOpener';
import {Logger} from 'UI/Utils';
import {IStickyOpener, IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';

const getStickyConfig = (config) => {
    config = config || {};
    config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
    // Открывается всегда вдомным
    config._vdomOnOldPage = config.hasOwnProperty('_vdomOnOldPage') ? config._vdomOnOldPage : true;
    return config;
};

const POPUP_CONTROLLER = 'Controls/popupTemplate:StickyController';

/*
 * Component that opens a popup that is positioned relative to a specified element.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/sticky/ See more}.
 * @class Controls/_popup/Opener/Sticky
 * @extends Controls/_popup/Opener/BaseOpener
 * @mixes Controls/interface/IOpener
 * @control
 * @author Красильников А.С.
 * @category Popup
 * @demo Controls-demo/Popup/Opener/StickyPG
 * @public
 */

/**
 * Контрол, открывающий всплывающее окно, которое позиционнируется относительно вызывающего элемента.
 * @remark
 * Подробнее о работе с контролом читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/sticky/ здесь}.
 * @class Controls/_popup/Opener/Sticky
 * @extends Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/ISticky
 * @control
 * @author Красильников А.С.
 * @category Popup
 * @demo Controls-demo/Popup/Opener/StickyPG
 * @public
 */

interface IStickyOpenerOptions extends IStickyPopupOptions, IBaseOpenerOptions {}

class Sticky extends BaseOpener<IStickyOpenerOptions> implements IStickyOpener {
    readonly '[Controls/_popup/interface/IStackOpener]': boolean;

    open(popupOptions: IStickyPopupOptions): Promise<string | undefined> {
        return super.open(getStickyConfig(popupOptions), POPUP_CONTROLLER);
    }

    static openPopup(config: IStickyPopupOptions): Promise<string> {
        return new Promise((resolve) => {
            const newCfg = getStickyConfig(config);
            if (!newCfg.hasOwnProperty('opener')) {
                Logger.error('Controls/popup:Sticky: Для открытия окна через статический метод, обязательно нужно указать опцию opener');
            }
            BaseOpener.requireModules(newCfg, POPUP_CONTROLLER).then((result) => {
                BaseOpener.showDialog(result[0], newCfg, result[1]).then((popupId: string) => {
                    resolve(popupId);
                });
            });
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }

    static getDefaultOptions(): IStickyOpenerOptions {
        // На старом WindowManager пофиксили все известные баги, пробую все стики окна открывать всегда вдомными
        return {...BaseOpener.getDefaultOptions(), ...{_vdomOnOldPage: true}};
    }
}

export default Sticky;
