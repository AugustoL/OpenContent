angular.module('OCApp.controllers').controller('homeCtrl',['$scope', 'web3Service', '$filter','$rootScope', function($scope, web3Service, $filter, $rootScope){

    if (!$scope.page)
        $scope.page = 0;
    if (!$scope.boardAddress)
        $scope.boardAddress = '0x0';
    $scope.posts = [];

    if (!$scope.indexInfo)
        $scope.indexInfo = {
            posts : 0,
            users : 0,
            tags : 0
        }

    $rootScope.$on('indexLoaded', function(event, data) {
        $scope.indexInfo = data;
    });

    $scope.$on('boardChange', function(event, data) {
        $scope.boardAddress = data.board;
        $scope.page = data.page;
        $scope.loadPosts();
    });

    $scope.loadPosts = function(){
        console.log('loading posts of '+$scope.boardAddress);
        var limit = parseInt($scope.page*10);
        $scope.posts = [];
        if (limit == 0)
            limit = 10;
        if ($scope.boardAddress == '0x0'){
            for (var i = 0; i < limit; i++) {
                if (i < $scope.indexInfo.posts)
                $scope.posts.push(web3Service.getHomePost(i));
            }
        } else {
            var tagInfo = web3Service.getTagInfo($scope.boardAddress);
            console.log(parseInt(tagInfo[1]));
            for (var i = 0; i < limit; i++) {
                if (i < parseInt(tagInfo[1]))
                    $scope.posts.push(web3Service.getTagPost($scope.boardAddress ,i));
            }
        }
        $scope.loadingHome = false;
    }

}]);
