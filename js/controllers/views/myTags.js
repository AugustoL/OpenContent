angular.module('OCApp.controllers').controller('myTagsCtrl',['$scope','web3Service','$filter','$rootScope', function($scope, web3Service, $filter, $rootScope){

    $scope.tags = [];
    $scope.newTagName = "";
    $scope.viewForm = false;

    $rootScope.$on('accountChange', function(event, data) {
        $scope.account = data;
    });

    $scope.createTag = function(){
        if ($scope.newTagName.length <= 32){
            web3Service.createTag($scope.newTagName);
        }
    };

}]);
