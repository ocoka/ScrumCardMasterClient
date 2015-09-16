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
        this.ready=$q(function (res,rej){
                koaws.register('session', function (err, payload) {
                    if (err) console.error('Something went wrong', err);
                    res(payload);
                });
                koaws.connect('ws://127.0.0.1:3000');
        });


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
        function scrummerRouteChangeListener(e,message){
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
            if (message!=null){
                $rootScope.loadingMessage=message;
            }

        }
        $rootScope.$on("l0ad.start",scrummerRouteChangeListener);
        $rootScope.$on("l0ad.stop",scrummerRouteChangeListener);
            window.$q=$q;
            window.$http=$http;
}]

);