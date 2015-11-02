/*global angular*/

'use strict';
angular.module('Scrummer.Login', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'Login/view.html',
    controller: 'ctrLogin as ctl'
  });
}])
.controller('ctrLogin',["$scope","$http","$location",'$ko',function($scope,$http,$l,$ko) {
  $scope.registration={
    playerName:"",
    playerPass:""
  };
  $scope.errors={};
  var _this=this;
    $ko.disconnect();
  this.doLogin=function doLogin(setValidationAs){
    $scope.errors={};
    $http.post("/back/login",$scope.registration).then(
          function(result){
            if (result.data.result!='success'){
                Object.keys(result.data.errors).forEach(function(el){
                  setValidationAs(el,false);
                });
                $scope.errors=result.data.errors;
            }else{
              $l.path("/round");
            }
          },
          function(){
              $scope.errors={internal:"Server unavailable"};
          }
      )
    }
}]);
