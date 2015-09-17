'use strict';

angular.module('Scrummer.Round', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/round', {
            templateUrl: 'Round/view.html',
            controller: 'ctrRound'
        });
    }])
    .controller('ctrRound', ['$scope','$ko',"$location",function($scope,$ko,$l) {
        $ko.ready.then(
            function(data){
                $scope.$emit("l0ad.start","waiting for round to begin");
            },
            function(data){
                $scope.$emit("l0ad.start","access denied");
                $l.path("/login");
            }
        );
    }]);