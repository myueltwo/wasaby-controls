/**
 * Created by dv.zuev on 25.12.2017.
 */
define('Controls/Application',
   [
      'Core/Control',
      'wml!Controls/Application/Page',
      'Core/Deferred',
      'Core/BodyClasses',
      'Env/Env',
      'Controls/Application/AppData',
      'Controls/scroll',
      'Core/LinkResolver/LinkResolver',
      'Application/Env',
      'Core/Themes/ThemesController',
      'css!theme?Controls/Application/Application'
   ],

   /**
    * Root component for WS applications. Creates basic html page.
    *
    * @class Controls/Application
    * @extends Core/Control
    * @control
    * @public
    * @author Зуев Д.В.
    */

   /**
    * @name Controls/Application#staticDomains
    * @cfg {Number} The list of domains for distributing static resources. These domains will be used to create paths
    * for static resources and distribute downloading for several static domains.
    * There will be another way to propagate this data after this problem:
    * https://online.sbis.ru/opendoc.html?guid=d4b76528-b3a0-4b9d-bbe8-72996d4272b2
    */

   /**
    * @name Controls/Application#head
    * @cfg {Content} Additional content of HEAD tag. Can accept more than one root node
    */

   /**
    * @name Controls/Application#content
    * @cfg {Content} Content of BODY tag
    */

   /**
    * @name Controls/Application#scripts
    * @cfg {Content} Scripts, that will be pasted after content. Can accept more than one root node
    */

   /**
    * @name Controls/Application#appRoot
    * @cfg {String} Path to application root url
    */

   /**
    * @name Controls/Application#resourceRoot
    * @cfg {String} Path to resource root url
    */

   /**
    * @name Controls/Application#wsRoot
    * @cfg {String} Path to ws root url
    */

   /**
    * @name Controls/Application#beforeScripts
    * @cfg {Boolean} If it's true, scripts from options scripts will be pasted before other scripts generated by application
    * otherwise it will be pasted after.
    */

   /**
    * @name Controls/Application#viewport
    * @cfg {String} Content attribute of meta tag with name "viewport"
    */

   /**
    * @name Controls/Application#bodyClass
    * @cfg {String} String with classes, that will be pasted in body's class attribute
    */

   /**
    * @name Controls/Application#title
    * @cfg {String} title of the tab
    */

   /**
    * @name Controls/Application#templateConfig
    * @cfg {Object} All fields from this object will be passed to content's options
    */

   /**
    * @name Controls/Application#compat
    * @cfg {Boolean} If it's true, compatible layer will be loaded
    */

   /**
    * @name Controls/Application#builder
    * @cfg {Boolean} Allows to create static html with builder
    */

   /**
    * @name Controls/Application#builderCompatible
    * @cfg {Boolean} Will load compatible layer. Works only if builder option is true.
    */

   /**
    * @name Controls/Application#width
    * @cfg {String} Used by Controls.Popup.Manager
    *
    * @css @font-size_App__body Font size of page body. This size inherits to other elements in page.
    */

   function(Base,
      template,
      Deferred,
      BodyClasses,
      Env,
      AppData,
      scroll,
      LinkResolver,
      AppEnv,
      ThemesController) {
      'use strict';

      var _private;

      _private = {

         /**
          * Перекладываем опции или recivedState на инстанс
          * @param self
          * @param cfg
          * @param routesConfig
          */
         initState: function(self, cfg) {
            self.templateConfig = cfg.templateConfig;
            self.compat = cfg.compat || false;
         },
         calculateBodyClasses: function() {
            // Эти классы вешаются в двух местах. Разница в том, что BodyClasses всегда возвращает один и тот же класс,
            // а TouchDetector реагирует на изменение состояния.
            // Поэтому в Application оставим только класс от TouchDetector

            var bodyClasses = BodyClasses().replace('ws-is-touch', '').replace('ws-is-no-touch', '');

            if (Env.detection.isMobileIOS) {
               bodyClasses += ' ' + this._scrollingClass;
            }

            return bodyClasses;
         }
      };
      var Page = Base.extend({
         _template: template,

         /**
          * @type {String} Property controls whether or not touch devices use momentum-based scrolling for inner scrollable areas.
          * @private
          */
         _scrollingClass: 'controls-Scroll_webkitOverflowScrollingTouch',

         _getChildContext: function() {
            return {
               ScrollData: this._scrollData
            };
         },

         _scrollPage: function(ev) {
            ev.blockUpdate = true;
            this._children.scrollDetect.start(ev);
         },

         _resizePage: function(ev) {
            this._children.resizeDetect.start(ev);
         },
         _mousedownPage: function(ev) {
            ev.blockUpdate = true;
            this._children.mousedownDetect.start(ev);
         },
         _mousemovePage: function(ev) {
            this._children.mousemoveDetect.start(ev);
         },
         _mouseupPage: function(ev) {
            ev.blockUpdate = true;
            this._children.mouseupDetect.start(ev);
         },
         _touchmovePage: function(ev) {
            this._children.touchmoveDetect.start(ev);
         },
         _touchendPage: function(ev) {
            this._children.touchendDetect.start(ev);
         },
         _touchclass: function() {
            // Данный метод вызывается из вёрстки, и при первой отрисовке еще нет _children (это нормально)
            // поэтому сами детектим touch с помощью compatibility
            return this._children.touchDetector
               ? this._children.touchDetector.getClass()
               : Env.compatibility.touch
                  ? 'ws-is-touch'
                  : 'ws-is-no-touch';
         },

         /**
          * Код должен быть вынесен в отдельных контроллер в виде хока в 610.
          * https://online.sbis.ru/opendoc.html?guid=2dbbc7f1-2e81-4a76-89ef-4a30af713fec
          */
         _popupCreatedHandler: function() {
            this._isPopupShow = true;

            this._changeOverflowClass();
         },

         _popupDestroyedHandler: function(event, element, popupItems) {
            if (popupItems.getCount() === 0) {
               this._isPopupShow = false;
            }

            this._changeOverflowClass();
         },

         _suggestStateChangedHandler: function(event, state) {
            this._isSuggestShow = state;

            this._changeOverflowClass();
         },

         /** ************************************************** */

         _changeOverflowClass: function() {
            if (this._isPopupShow || this._isSuggestShow) {
               this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingAuto';
            } else {
               this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingTouch';
            }

            // We have to call forceUpdate, because template doesn't use
            // '_scrollingClass' from state, but template uses method
            // calculateBodyClasses which uses _scrollingClass.
            // We should trigger manually template's update
            this._forceUpdate();
         },


         _beforeMount: function(cfg, context, receivedState) {
            var self = this,
               def = new Deferred();

            var appData = AppData.getAppData();

            self._scrollData = new scroll._scrollContext({pagingVisible: false});

            self.onServer = typeof window === 'undefined';
            self.isCompatible = cfg.compat || self.compat;
            _private.initState(self, receivedState || cfg);
            if (!receivedState) {
               receivedState = {};
            }

            self.buildnumber = cfg.buildnumber || Env.constants.buildnumber;

            // TODO Ждем https://online.sbis.ru/opendoc.html?guid=c3d5e330-e4d6-44cd-9025-21c1594a9877
            self.appRoot = cfg.appRoot || appData.appRoot || (cfg.builder ? '/' : Env.constants.appRoot);
            self.staticDomains = cfg.staticDomains || appData.staticDomains || Env.constants.staticDomains || '[]';
            if (typeof self.staticDomains !== 'string') {
               self.staticDomains = '[]';
            }

            self.wsRoot = cfg.wsRoot || Env.constants.wsRoot;
            self.resourceRoot = cfg.resourceRoot || Env.constants.resourceRoot;

            // TODO сейчас нельзя удалить, ждем реквеста https://online.sbis.ru/opendoc.html?guid=c3d5e330-e4d6-44cd-9025-21c1594a9877
            // Т.к. это должно храниться в отдельном сторе
            self.RUMEnabled = cfg.RUMEnabled ? cfg.RUMEnabled : (appData.RUMEnabled || '');
            self.pageName = cfg.pageName || appData.pageName || '';
            self.product = appData.product || cfg.product || Env.constants.product;
            self.lite = cfg.lite || false;

            // TODO нужно удалить после решения https://online.sbis.ru/opendoc.html?guid=a9ceff55-1c8b-4238-90a7-22dde0e1bdbe
            self.servicesPath = appData.servicesPath || cfg.servicesPath || Env.constants.defaultServiceUrl || '/service/';
            self.BodyClasses = _private.calculateBodyClasses;
            self.application = appData.application;


            if (typeof window === 'undefined' && cfg.theme !== 'default') {
               ThemesController.getInstance().themes = {};
               ThemesController.getInstance().setTheme(cfg.theme);
            }
            var headData = AppEnv.getStore('HeadData');

            self.linkResolver = new LinkResolver(headData.isDebug,
               self.buildnumber,
               self.wsRoot,
               self.appRoot,
               self.resourceRoot);

            // LinkResolver.getInstance().init(context.headData.isDebug, self.buildnumber, self.appRoot, self.resourceRoot);

            headData.pushDepComponent(self.application, false);

            // Временно положим это в HeadData, потом это переедет в константы реквеста
            headData.isNewEnvironment = !self.isCompatible;

            if (receivedState.csses && !headData.isDebug) {
               ThemesController.getInstance().initCss({
                  themedCss: receivedState.csses.themedCss,
                  simpleCss: receivedState.csses.simpleCss
               });
            }

            /**
             * Этот перфоманс нужен, для сохранения состояния с сервера, то есть, cfg - это конфиг, который нам прийдет из файла
             * роутинга и с ним же надо восстанавливаться на клиенте.
             */
            def.callback({
               buildnumber: self.buildnumber,
               lite: self.lite,
               csses: ThemesController.getInstance().getCss(),
               appRoot: self.appRoot,
               staticDomains: self.staticDomains,
               wsRoot: self.wsRoot,
               resourceRoot: self.resourceRoot,
               templateConfig: self.templateConfig,
               servicesPath: self.servicesPath,
               compat: self.compat,
               product: self.product
            });
            return def;
         },

         _afterUpdate: function() {
            var elements = document.getElementsByClassName('head-title-tag');
            if (elements.length === 1) {
               elements[0].textContent = this._options.title;
            }
         },

         _keyPressHandler: function(event) {
            if (this._isPopupShow) {
               if (Env.constants.browser.safari) {
                  // Need to prevent default behaviour if popup is opened
                  // because safari escapes fullscreen mode on 'ESC' pressed
                  // TODO https://online.sbis.ru/opendoc.html?guid=5d3fdab0-6a25-41a1-8018-a68a034e14d9
                  if (event.nativeEvent && event.nativeEvent.keyCode === 27) {
                     event.preventDefault();
                  }
               }
            }
         }
      });

      Page.getDefaultOptions = function() {
         return {
            title: ''
         };
      };

      return Page;
   });
