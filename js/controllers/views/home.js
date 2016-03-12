angular.module('OCApp.controllers').controller('homeCtrl',['$scope', 'web3Service', '$filter','$rootScope', function($scope, web3Service, $filter, $rootScope){

    if (!$scope.page)
        $scope.page = 0;
    if (!$scope.boardAddress)
        $scope.boardAddress = '0x0';
    $scope.posts = [];

    $scope.$on('boardChange', function(event, data) {
        $scope.boardAddress = data.board;
        $scope.page = data.page;
        $scope.loadPosts();
    });

    $scope.loadPosts = function(){
        var limit = parseInt($scope.page*10);
        $scope.posts = [];
        if (limit == 0)
            limit = 10;
        if ($scope.boardAddress == '0x0'){
            console.log('Loading posts of home');
            for (var i = 0; i < limit; i++)
                if (i < parseInt($scope.indexInfo.posts))
                    $scope.posts.push(web3Service.getHomePost(i));
        } else {
            console.log('Loading posts of board'+$scope.boardAddress);
            var boardInfo = web3Service.getBoardInfo($scope.boardAddress);
            for (var i = 0; i < limit; i++)
                if (i < parseInt(boardInfo[2]))
                    $scope.posts.push(web3Service.getBoardPost($scope.boardAddress ,i));
        }
        console.log($scope.posts);
        $scope.loadingHome = false;
    }

    $scope.loadPosts();

}]);
