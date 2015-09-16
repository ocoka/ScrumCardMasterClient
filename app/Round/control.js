'use strict';

angular.module('Scrummer.Round', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/round', {
            templateUrl: 'Round/view.html',
            controller: 'ctrRound'
        });
    }])
    .controller('ctrRound', ['$scope','$ko',function($scope,$ko) {
        $ko.ready.then(
            function(data){
                $scope.$emit("l0ad.start","waiting for round to begin");
            }
        );
    }]);