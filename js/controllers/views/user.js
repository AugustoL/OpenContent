angular.module('OCApp.controllers').controller('userCtrl',['$scope','web3Service','session', function($scope, web3Service, session){

    $scope.userProfile = {
        email : "",
        username : "",
        name : "",
        birth : "",
        location : "",
        image : "",
        url1 : "",
        url2 : "",
        posts : []
    }

}]);
