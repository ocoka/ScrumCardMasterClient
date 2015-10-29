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
    password:"",
    errors:""
  };
  var _this=this;
    $ko.disconnect();
  this.doLogin=function doLogin(){
    $http.post("/back/login",$scope.registration).then(
          function(result){
            if (result.data.result!='success'){
              $scope.registration.errors=result.data.errors;
            }else{
              $l.path("/round");
            }
          },
          function(data){
              $scope.errors=["Server unavailable"];
          }
      )
    }
}]);
