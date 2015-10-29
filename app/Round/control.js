'use strict';

angular.module('Scrummer.Round', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/round', {
            templateUrl: 'Round/view.html',
            controller: 'ctrRound'
        });
    }])
    .controller('ctrRound', ['$scope','$ko',"$location",function($scope,$ko,$l) {

        $ko.on('stat',function(){
            $scope.players=this.params;
            $scope.$apply();
        });
        $scope.$on("$destroy",function(){
            $ko.off('stat');
        });
    }]);
