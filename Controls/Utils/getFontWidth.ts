import {detection} from 'Env/Env';
import { headDataStore } from 'UI/Base';
import {Logger} from 'UI/Utils';
import ModuleLoader = require('Controls/Container/Async/ModuleLoader');

const moduleLoader = new ModuleLoader();
const constants = 'Controls/Utils/FontWidthConstants/';

let fonts;

export const getFontWidth = (text, size) => {
    // Инициализируем константы с размерами на клиенте
    if (isClient()) {
        if (!fonts) {
            const browser = getBrowser();
            const module = constants + browser;
            if (moduleLoader.isLoaded(module)) {
                fonts = moduleLoader.loadSync(module)[browser];
            } else {
                generateErrorMessage();
            }
        }
    } else {
        generateErrorMessage();
    }
    return getFontWidthWithFonts(fonts, text, size);
};

const generateErrorMessage = () => {
    const message = `Получение размеров текста было вызвано до загрузки данных с размерами. Для корректной работы
        необходимо вызвать метод loadFontWidthConstants`;
    Logger.error(`Utils/getFontWidth: ${message}`);
}

const getFontWidthWithFonts = (font, text, size) => {
    let textWidth = 0;
    for (let i = 0; i < text.length; i++) {
        textWidth += font[size][text[i]];
    }
    return textWidth;
};

const getBrowser = () => {
    if (detection.firefox) {
        return 'FF';
    }
    if (detection.safari) {
        return 'Safari';
    }
    if (detection.isIE) {
        return 'IE';
    }
    return 'Chrome';
};

const isClient = () => {
    return typeof window !== 'undefined';
};

const getModuleName = () => {
    const browser = getBrowser();
    return constants + browser;
};

export const loadFontWidthConstants = () => {
    const module = getModuleName();
    const getCallbackFunction = (font) => {
        return getFontWidthWithFonts.bind(null, font);
    };
    return new Promise((resolve) => {
        if (!isClient()) {
            // положим файл с константами в head, чтобы на клиенте запросить синхронно
            headDataStore.read('pushDepComponent')(module, true);
        } else if (fonts) {
            return resolve(getCallbackFunction(fonts));
        }

        import(module).then((fontConst) => {
            // Нельзя константы запоминать в глобальную область видимости.
            // На сервере запросы с разных браузеров будут обрабатываться в одном скоупе, из-за чего
            // константы, загруженные для одного браузера, будут применены для другого браузера.
            // Из функции, загружающей данные, возвращаю колбэк функцию для расчета размеров с забинженными константами
            const browserFontSizes = fontConst[getBrowser()];
            resolve(getCallbackFunction(browserFontSizes));
        });
    });
};
