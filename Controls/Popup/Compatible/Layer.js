/**
 * Created by as.krasilnikov on 14.05.2018.
 */
define('Controls/Popup/Compatible/Layer', [
   'Core/Deferred',
   'Core/ParallelDeferred',
   'Core/constants',
   'Core/RightsManager',
   'Core/ExtensionsManager',
   'Core/moduleStubs',
   'Core/IoC',
   'WS.Data/Source/SbisService'
], function(Deferred, ParallelDeferred, Constants, RightsManager, ExtensionsManager, moduleStubs, IoC, SbisService) {
   'use strict';

   var loadDeferred;
   var compatibleDeps = [
      'cdn!jquery/3.3.1/jquery-min.js',
      'Lib/Control/Control.compatible',
      'Lib/Control/AreaAbstract/AreaAbstract.compatible',
      'Lib/Control/BaseCompatible/BaseCompatible',
      'Core/vdom/Synchronizer/resources/DirtyCheckingCompatible',
      'View/Runner/Text/markupGeneratorCompatible',
      'Core/nativeExtensions'
   ];
   var defaultLicense = {
      defaultLicense: true
   };

   function isNewEnvironment() {
      return !!document.getElementsByTagName('html')[0].controlNodes;
   }

   function loadDataProviders(parallelDef) {

      parallelDef.push(ExtensionsManager.loadExtensions().addErrback(function(err) {
         IoC.resolve('ILogger').error('Layer', 'Can\'t load system extensions', err);
         return err;
      }));

      parallelDef.push(RightsManager.readUserRights().addCallbacks(function(rights) {
         // возможно можно уже удалить, это совместимость со старым форматом прав. на препроцессоре не удалено, решил скопировать и сюда
         if (rights) {
            Object.keys(rights).forEach(function(id) {
               var right = rights[id];
               if (right) {
                  if (typeof right === 'number') {
                     rights[id] = right;
                  } else if (right.flags) {
                     // Копируем, если доступ > 0
                     if (right.restrictions) {
                        // Если новый формат, копируем объект целиком
                        rights[id] = right;
                     } else {
                        // Если старый формат, копируем только число-флаг
                        rights[id] = right.flags;
                     }
                  }
               }
            });
         }
         Constants.rights = true;
         window.rights = rights || {};
      }, function(err) {
         IoC.resolve('ILogger').error('Layer', 'Can\'t load user rights', err);
      }));

      // parallelDef.push(viewSettingsData().addCallbacks(function(viewSettings) {
      //    window.viewSettings = viewSettings || {};
      // }, function(err) {
      //    IoC.resolve('ILogger').error('Layer', 'Can\'t load view settings', err);
      // }));

      parallelDef.push(userInfo().addCallback(function(userInfo) {
         window && (window.userInfo = userInfo);
      }));

      parallelDef.push(getUserLicense().addCallbacks(function(userLicense) {
         window.userLicense = userLicense || defaultLicense;
      }, function(err) {
         IoC.resolve('ILogger').error('Layer', 'Can\'t load user license', err);
      }));

      //globalClientConfig
      // параметры пользователськие, клиенстские, глобальные. причем они в session или localStorage могут быть
      // параметры нужно положить в контекст (белый список)
      // parallelDef.push(readGlobalClientConfig().addCallbacks(function(globalClientConfig) {
      //    window.globalClientConfig = globalClientConfig || {};
      // }, function(err) {
      //    IoC.resolve('ILogger').error('Layer', 'Can\'t load global client config', err);
      // }));

      //cachedMethods
      window.cachedMethods = [];

      //product
      window.product = 'продукт никому не нужен?';

      //активность???
   }

   // function viewSettingsData() {
   //    var
   //       dResult = new Deferred(),
   //       viewSettings = {};
   //
   //    moduleStubs.require(['OnlineSbisRu/ViewSettings/Util/ViewSettingsData']).addCallback(function(mods) {
   //       mods[0].getData(null, true).addCallback(function(data) {
   //          viewSettings = data;
   //          dResult.callback(viewSettings);
   //       }).addErrback(function() {
   //          dResult.callback(viewSettings);
   //       });
   //    }).addErrback(function() {
   //       dResult.callback(viewSettings);
   //    });
   //    return dResult;
   // }

   function userInfo() {
      var
         userSource = new SbisService({
            endpoint: 'Пользователь'
         }),
         profileSource = new SbisService({
            endpoint: 'СервисПрофилей'
         });

      return userSource.call('GetCurrentUserInfo', {}).addCallback(function(res) {
         var
            deferred,
            result = res.getRow(),
            data = {};
         if (result) {
            result.each(function(k, v) {
               data[k] = v;
            });
         }
         data.isDemo = data['ВыводимоеИмя'] === 'Демо-версия';
         data.isPersonalAccount = data['КлассПользователя'] === '__сбис__физики';

         if (data['КлассПользователя'] == '__сбис__физики') {
            deferred = profileSource.call('ЕстьЛиУМеняАккаунтПомимоФизика').addCallback(function(res) {
               data.hasMoreAccounts = res.getScalar();
               return data;
            });
         } else {
            deferred = Deferred.success(data);
         }

         return deferred;
      }).addErrback(function(e) {
         IoC.resolve('ILogger').error('User info', 'Transport error', e);
         return {};
      });
   }

   function getUserLicense() {
      var def = new Deferred();

      new SbisService({endpoint: 'Биллинг'}).call('ДанныеЛицензии', {}).addCallbacks(function(record) {
         if (record && record.getRow().get('ПараметрыЛицензии')) {
            var data = record.getRow().get('ПараметрыЛицензии').toObject();
            def.callback(data);
         } else {
            def.callback(defaultLicense);
         }
      }, function(err) {
         def.errback(err);
      });

      return def;
   }

   // function readGlobalClientConfig() {
   //    var def = new Deferred();
   //
   //    var gcc = {};
   //    new SbisService({endpoint: 'ГлобальныеПараметрыКлиента'}).call('ПолучитьПараметры', {}).addCallbacks(function(rs) {
   //       rs = rs.getAll();
   //       rs.forEach(function(r) {
   //          gcc[r.get('Название')] = r.get('Значение');
   //       });
   //       def.callback(gcc);
   //    }, function(err) {
   //       def.errback(err);
   //    });
   //
   //    return def;
   // }

   function finishLoad(loadDeferred, result) {
      moduleStubs.require(['Core/core-extensions', 'cdn!jquery-cookie/04-04-2014/jquery-cookie-min.js']).addCallbacks(function() {
         loadDeferred.callback(result);
         require(['UserActivity/ActivityMonitor', 'UserActivity/UserStatusInitializer']);
      }, function(e) {
         IoC.resolve('ILogger').error('Layer', 'Can\'t load core extensions', e);
         loadDeferred.callback(result);
         require(['UserActivity/ActivityMonitor', 'UserActivity/UserStatusInitializer']);
      });
   }

   return {
      load: function(deps, force) {
         if (!isNewEnvironment() && !force) { //Для старого окружения не грузим слои совместимости
            return (new Deferred()).callback();
         }
         if (!loadDeferred) {
            loadDeferred = new Deferred();

            deps = (deps || []).concat(compatibleDeps);

            var parallelDef = new ParallelDeferred(),
               result;

            var loadDepsDef = moduleStubs.require(deps).addCallback(function(_result) {
               if (window && window.$) {
                  Constants.$win = $(window);
                  Constants.$doc = $(document);
                  Constants.$body = $('body');
               }

               // constants.compat = tempCompatVal; //TODO выпилить
               (function($) {
                  $.fn.wsControl = function() {
                     var control = null,
                        element;
                     try {
                        element = this[0];
                        while (element) {
                           if (element.wsControl) {
                              control = element.wsControl;
                              break;
                           }
                           element = element.parentNode;
                        }
                     } catch (e) {
                     }
                     return control;
                  };
               })(jQuery);

               result = _result;
            }).addErrback(function(e) {
               IoC.resolve('ILogger').error('Layer', 'Can\'t load dependencies', e);
            });
            parallelDef.push(loadDepsDef);

            // var tempCompatVal = constants.compat;
            Constants.compat = true;
            Constants.systemExtensions = true;
            Constants.userConfigSupport = true;

            if (typeof window !== 'undefined') {
               loadDataProviders(parallelDef);
            }
            parallelDef.done().getResult().addCallbacks(function() {
               finishLoad(loadDeferred, result);
            }, function(e) {
               IoC.resolve('ILogger').error('Layer', 'Can\'t load data providers', e);
               finishLoad(loadDeferred, result);
            });

         }
         return loadDeferred;
      }
   };
});

