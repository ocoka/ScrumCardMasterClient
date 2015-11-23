/*global angular*/
'use strict';
angular.module('Scrummer.Round', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/round', {
    templateUrl: 'Round/view.html',
    controller: 'ctrRound as ctl'
  });
}])
.controller('ctrRound',["$scope","$http","$location",'$ko',function($scope,$http,$l,$ko) {
  $scope.registeredPlayers={
    "Vasya Pupkin":"master",
    "Ilya Repkin":"simple",
    "Igorek Zhukov":"simple",
    "Lev Srakin":"simple",
  }
}]);
