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
        this.register=function koRegister() {
            return $q(function (res, rej) {
                koaws.register('session', function (err, payload) {
                    if (err) console.error('Something went wrong', err);
                    res(payload);
                });
                koaws.onClose = function (type, e) {
                    rej(e);
                };
                koaws.connect('ws://127.0.0.1:3000');
            });
        }


        function KoaWSMethod(name,param){
            return $q(function(res,rej){
                koaws.method(name, function (err, result) {
                    if (err) {rej(err);}
                    else{
                        res(result);
                    }
                });
            });
        }
        this.stat=KoaWSMethod.bind(this,'stat');

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