/**
 * Created by as.krasilnikov on 13.04.2018.
 */
define('Controls/Popup/Compatible/CompoundAreaForNewTpl/CompoundArea',
   [
      'Lib/Control/CompoundControl/CompoundControl',
      'tmpl!Controls/Popup/Compatible/CompoundAreaForNewTpl/CompoundArea',
      'Core/vdom/Synchronizer/Synchronizer',
      'Core/Control'
   ],
   function(CompoundControl,
      template,
      Sync,
      control) {
      /**
       * Слой совместимости для открытия новых шаблонов в старых попапах
       **/
      var moduleClass = CompoundControl.extend({
         _dotTplFn: template,
         $protected: {
            _options: {
               isTMPL: function(template) {
                  return template.indexOf('tmpl!') === 0;
               }
            }
         },
         init: function() {
            moduleClass.superclass.init.apply(this, arguments);
            var self = this;
            this._onCloseHandler = this._onCloseHandler.bind(this);
            this._onResultHandler = this._onResultHandler.bind(this);
            this._onCloseHandler.control = this._onResultHandler.control = this;
            require([this._options.innerComponentOptions.template], function(ctr) {
               if (!self._options.isTMPL(self._options.innerComponentOptions.template)) {
                  self._vDomTemplate = control.createControl(ctr, self._options.innerComponentOptions, $('.vDomWrapper', self.getContainer()));
                  var replaceVDOMContainer = function() {
                     self._getRootContainer().eventProperties = {
                        'on:close': [{
                           fn: self._onCloseHandler,
                           args: []
                        }],
                        'on:sendresult': [{
                           fn: self._onResultHandler,
                           args: []
                        }]
                     };
                  };
                  if (self._options._initCompoundArea) {
                     self._notifyOnSizeChanged(self, self);
                     self._options._initCompoundArea(self);
                  }
                  self._getRootContainer().addEventListener('DOMNodeRemoved', function() {
                     replaceVDOMContainer();
                  });
               }
            });
         },
         _onCloseHandler: function() {
            this.sendCommand('close', this._result);
            this._result = null;
         },
         _onResultHandler: function(event, result) {
            this._result = result;
            if (this._options.onResultHandler) {
               this._options.onResultHandler(this._result);
            }
         },

         _getRootContainer: function() {
            var container = this._vDomTemplate.getContainer();
            return container.get ? container.get(0) : container;
         },

         destroy: function() {
            moduleClass.superclass.destroy.apply(this, arguments);
            Sync.unMountControlFromDOM(this._vDomTemplate, this._vDomTemplate._container);
         },
         _modifyOptions: function(cfg) {
            var cfg = moduleClass.superclass._modifyOptions.apply(this, arguments);
            require([cfg.template]);
            return cfg;
         },

         _forceUpdate: function() {
            //Заглушка для ForceUpdate которого на compoundControl нет
         }
      });

      moduleClass.dimensions = {
         resizable: false
      };

      return moduleClass;
   }
);
