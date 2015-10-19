'use strict';

// Declare app level module which depends on views, and components
angular.module('Scrummer', [
    'ngRoute',
    'Scrummer.Login',
    'Scrummer.Round'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: 'login'});
}]).service('$ko',['$q',function koService($q){
        var registrationPromise=null;

        this.register=function koRegister() {
            if (registrationPromise==null) {
                registrationPromise=$q(function (res, rej) {
                    koaws.register('session', function () {
                        res(this.params);
                    });
                    koaws.onClose = function (type, e) {
                        registrationPromise=null;
                        rej(e);
                    };
                    koaws.connect('ws://127.0.0.1:3000');
                });
            }
            return registrationPromise;

        };


        function KoaWSMethod(name,param){
            return $q(function(res,rej){
                koaws.method(name, param,function (err,result) {
                    if (err) {rej(err);}
                    else{
                        res(result);
                    }
                });
            });
        }

        var eventHandlers={};
        function functionHandlerIterator(){
            var _this=this;
            eventHandlers[this.method].forEach(function(el){
                el.apply(_this);
            });
        }

        function registerEventHandler(event,handler){
            if (eventHandlers[event]==null){
                koaws.register(event,functionHandlerIterator)
                eventHandlers[event]=[];
            }
            eventHandlers[event].push(handler);
        }
        this.on=registerEventHandler;
        this.off=function(event){
            delete eventHandlers[event];
            eventHandlers[event]=[];
        };

        this.stat=KoaWSMethod.bind(this,'stat');
        this.disconnect=function(){
            koaws.disconnect(1000);
        }

    }])
    .run(["$rootScope","$q","$http",function($rootScope,$q,$http){
        function scrummerRouteChangeListener(e,data){
            $rootScope.message='loading';
            $rootScope.errMessage=null;
            $rootScope.showLogin=false;
            switch (e.name) {
                case 'l0ad.start':
                    $rootScope.loading=true;
                    break;
                case 'l0ad.stop':
                    $rootScope.loading=false;
                    break;
                default:
                    break;
            }
            if (data!=null){
                $rootScope.message=data.msg;
                $rootScope.errMessage=data.err;
                $rootScope.showLogin=!!data.showLogin;
            }

        }
        $rootScope.$on("l0ad.start",scrummerRouteChangeListener);
        $rootScope.$on("l0ad.stop",scrummerRouteChangeListener);
            window.$q=$q;
            window.$http=$http;
}]

);