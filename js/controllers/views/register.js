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
        if (
            ($scope.newUser.email.length <= 32)
            && ($scope.newUser.username.length <= 32)
            && ($scope.newUser.name.length <= 32)
            && ($scope.newUser.birth.length <= 10)
            && ($scope.newUser.location.length <= 32)
            && ($scope.newUser.image.length <= 32)
            && ($scope.newUser.url1.length <= 32)
            && ($scope.newUser.url2.length <= 32)
        ){
            web3Service.createUser($scope.newUser.name, $scope.newUser.username, $scope.newUser.email, $scope.newUser.location, $scope.newUser.birth, $scope.newUser.image, $scope.newUser.url1, $scope.newUser.url2, function(err,result){
                if (err)
                    console.log(err);
                $scope.refreshAccount();
            })
        }
    };
}]);
