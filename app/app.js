/*
global angular
*/
'use strict';

// Declare app level module which depends on views, and components
angular.module('Scrummer', [
  'Scrummer.Login',
  'Scrummer.Round',
  'ngRoute'
]).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({
      redirectTo: 'login'
    });
  }]).service('$ko', ['$q', '$rootScope', function koService($q, $root) {
    var koaws = window.koaws;
    var connectionState = 0;

    function KoaWSOnCloseOrError(type, e) {
      connectionState = 2;
      console.log(e);
      $root.broadcast("shutter.off", {
        isError: true,
        text: e
      });
    }

    koaws.onClose = koaws.onError = KoaWSOnCloseOrError;

    function KoaWSMethod(name, param) {
      if (connectionState < 2) {
        if (connectionState < 1) {
          koaws.connect(window.location.hostname + ':3000');
          connectionState = 1;
        }
        return $q(function(res, rej) {
          koaws.method(name, param, function(err, result) {
            if (err) {
              rej(err);
            } else {
              res(result);
            }
          });
        });
      }
    }

    var eventHandlers = {};

    function functionHandlerIterator() {
      var _this = this;
      eventHandlers[this.method].forEach(function(el) {
        el.apply(_this);
      });
    }

    function registerEventHandler(event, handler) {
      if (eventHandlers[event] == null) {
        koaws.register(event, functionHandlerIterator)
        eventHandlers[event] = [];
      }
      eventHandlers[event].push(handler);
    }
    this.on = registerEventHandler;
    this.off = function(event) {
      delete eventHandlers[event];
      eventHandlers[event] = [];
    };

    this.method = KoaWSMethod;
    this.disconnect = function() {
      koaws.disconnect(1000);
    };

  }])
  .run(["$rootScope", function($rootScope) {
      $rootScope.shutter = false;
      $rootScope.shutterMessage = {
        text: '...Loading...',
        isError: false
      };

      function shutterStatusListener(e, data) {
        switch (e.name) {
          case 'shutter.on':
            $rootScope.shutter = true;
            break;
          case 'shutter.off':
            $rootScope.shutter = false;
            break;
          default:
            break;
        }
        if (data != null) {
          angular.extend($rootScope.shutterMessage, data);
        }
      }
      $rootScope.$on("shutter.on", shutterStatusListener);
      $rootScope.$on("shutter.off", shutterStatusListener);
    }]

  );
