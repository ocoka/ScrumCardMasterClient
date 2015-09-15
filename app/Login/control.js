'use strict';
angular.module('Scrummer.Login', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'Login/view.html',
    controller: 'ctrLogin as ctl'
  });
}])
.controller('ctrLogin',["$scope","$http","$location",function($scope,$http,$l) {
  this.playerName="";
  this.password="";
  this.errors=null;
  var _this=this;
  this.doLogin=function doLogin(){
    if (this.playerName.length>0){
      $http.post("/back/login",{playerName:this.playerName,password:this.password}).then(
          function(result){
            if (result.data.result!='success'){
              _this.errors=result.data.errors;
            }else{
                $scope.$emit("l0ad.start",'waiting for round to start');
              $l.path("/round");
            }
          },
          function(data){
            console.warn(data);
          }
      )
    }
  }
}]);