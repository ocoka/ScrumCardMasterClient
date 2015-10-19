'use strict';

angular.module('Scrummer.Round', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/round', {
            templateUrl: 'Round/view.html',
            controller: 'ctrRound'
        });
    }])
    .controller('ctrRound', ['$scope','$ko',"$location","$rootScope",function($scope,$ko,$l) {

        $ko.on('stat',function(){
            $scope.players=this.params;
            $scope.$apply();
        });
        $scope.$on("$destroy",function(){
            $ko.off('stat');
        });

        $ko.register().then(
            function(data){
                if (data.role=='player'){
                    $scope.$emit("l0ad.start",{msg:"...waiting for round start...",showLogin:false});
                }else{
                    $scope.$emit("l0ad.stop");
                }
                return $ko.stat();
            },
            function(data){
                var err={msg:"the server dismiss a connection",showLogin:true};
                $scope.$emit("l0ad.start",err);
                throw Error(err.msg);
            }
        ).then(function(data){
            if (data!=null){
                $scope.players=data;
            }
            else{
                $scope.$emit("l0ad.start",{msg:"got incorrect data from server",showLogin:true});
            }
        });
    }]);