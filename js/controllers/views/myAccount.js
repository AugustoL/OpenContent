angular.module('OCApp.controllers').controller('myAccountCtrl',['$scope','web3Service','session', function($scope, web3Service, session){
    $scope.showEditAcc = false;

    $scope.editUser = $scope.account;
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
    $scope.editAccount = function(){
        if (
            ($scope.editUser.email.length <= 32)
            && ($scope.editUser.name.length <= 32)
            && ($scope.editUser.birth.length <= 10)
            && ($scope.editUser.location.length <= 32)
            && ($scope.editUser.image.length <= 32)
            && ($scope.editUser.url1.length <= 32)
            && ($scope.editUser.url2.length <= 32)
        ){
            web3Service.editUser($scope.editUser.name, $scope.editUser.email, $scope.editUser.location, $scope.editUser.birth, $scope.editUser.image, $scope.editUser.url1, $scope.editUser.url2, function(err,result){
                if (err)
                    console.log(err);
                $scope.refreshAccount();
            })
        } else {
            console.log('Too much bytes');
        }
    };

    $scope.deleteAccount = function(){
        web3Service.deleteAccount();
    }
}]);
