'use strict';

angular.module('Scrummer.Round', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/round', {
            templateUrl: 'Round/view.html',
            controller: 'ctrRound'
        });
    }])
    .controller('ctrRound', ['$scope','$ko',"$location","$rootScope",function($scope,$ko,$l,$root) {

        $ko.register().then(
            function(data){
                $scope.$emit("l0ad.start",{msg:"...waiting for round start...",showLogin:false});
                return $ko.stat();
            },
            function(data){
                var err={err:"the server dismiss a connection",showLogin:true};
                $scope.$emit("l0ad.start",err);
                throw Error(err.msg);
            }
        ).then(function(data){
            if (data.players!=null){
                $root.players=data.players;
            }
            else{
                $scope.$emit("l0ad.start",{err:"got incorrect data from server",showLogin:true});
            }
        });
    }]);