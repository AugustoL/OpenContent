angular.module('OCApp.controllers').controller('homeCtrl',['$scope', 'web3Service', '$filter','$rootScope', function($scope, web3Service, $filter, $rootScope){

    if (!$scope.page)
        $scope.page = 0;
    if (!$scope.boardAddress)
        $scope.boardAddress = '0x0';
    $scope.posts = [];

    $scope.indexInfo = {
        version: "",
        posts: 0
    };

    $rootScope.$on('appUpdate', function(event, data) {
        $scope.indexInfo = data.indexInfo;
    });

    $scope.$on('boardChange', function(event, data) {
        $scope.page = data.page;
        $scope.boardAddress = data.board;
        $scope.loadPosts();
    });

    $scope.loadPosts = function(){
        var limit = parseInt($scope.page*10);
        $scope.posts = [];
        if (limit == 0)
            limit = 10;
        if ($scope.boardAddress == '0x0'){
            for (var i = 0; i < limit; i++)
                if (i < parseInt($scope.indexInfo.posts))
                    $scope.posts.push(web3Service.getHomePost(i));
        } else {
            var boardInfo = web3Service.getBoardInfo($scope.boardAddress);
            for (var i = 0; i < limit; i++)
                if (i < parseInt(boardInfo[2]))
                    $scope.posts.push(web3Service.getBoardPost($scope.boardAddress ,i));
        }
    }

    $scope.loadPosts();

}]);
