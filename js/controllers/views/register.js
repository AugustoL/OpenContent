angular.module('OCApp.controllers').controller('registerCtrl',['$scope','web3Service', function($scope,web3Service){

    $scope.newUser = {
        email : "",
        username : "",
        name : "",
        birth : "",
        location : "",
        image : "",
        url1 : "",
        url2 : ""
    }
    $scope.createAccount = function(){
        if ($scope.newUser.username.length <= 32){
            web3Service.createUser($scope.newUser.username);
        }
    };
}]);
