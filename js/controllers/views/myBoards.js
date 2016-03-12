angular.module('OCApp.controllers').controller('myBoardsCtrl',['$scope','web3Service','$rootScope','session', function($scope, web3Service, $rootScope, session){

    $scope.boards = [];
    $scope.newBoardName = "";
    $scope.viewForm = false;

    $rootScope.$on('accountChange', function(event, data) {
        $scope.account = data;
    });

    console.log($scope.account.boards);

    $scope.createBoard = function(){
        if ($scope.newBoardName.length <= 32){
            web3Service.createBoard($scope.newBoardName);
        }
    };

    $scope.removeBoard = function(address){
        web3Service.removeBoard(address);
    };

    $scope.deleteBoard = function(address){
        web3Service.deleteBoard(address);
    };

}]);
