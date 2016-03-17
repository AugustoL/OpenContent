angular.module('OCApp.controllers').controller('sendCtrl',['$scope','web3Service', function($scope,web3Service){

    $scope.toAddress = "";
    $scope.amount = "";
    $scope.sendCoins = function(){
        web3Service.sendCoins($scope.toAddress,$scope.amount);
    };
}]);
