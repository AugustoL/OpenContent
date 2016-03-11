angular.module('OCApp.controllers').controller('myPostsCtrl',['$scope','web3Service','$filter','$rootScope', function($scope, web3Service, $filter, $rootScope){

    $scope.posts = [];
    $scope.postTitle = "";
    $scope.postImage = "";
    $scope.postContent = "";
    $scope.tagSelected = $scope.account.tags[0];
    $scope.selectTag = function(t){
        $scope.tagSelected = t;
    }
    $scope.viewForm = false;

    for (var i = 0; i < $scope.account.posts_size; i++) {
        var post = web3Service.getUserPost($scope.account.contract, i);
        $scope.posts.push(post);
    }

    $rootScope.$on('accountChange', function(event, data) {
        $scope.account = data;
        for (var i = 0; i < $scope.account.posts_size; i++) {
            var post = web3Service.getUserPost($scope.account.contract, i);
            $scope.posts.push(post);
        }
    });

    $scope.createPost = function(){
        $scope.bytesArray = [];
        for (var i = 0; i < 8; i++) {
            if ($scope.postContent.toString().match(/.{1,31}/g)[i])
                $scope.bytesArray.push( web3Service.toHex( $scope.postContent.toString().match(/.{1,31}/g)[i] ) );
            else
                $scope.bytesArray.push("0x0000000000000000000000000000000000000000000000000000000000000000");
        }
        if ( ($scope.postContent.toString().length <= 248) && ($scope.postTitle.toString().length <= 32) && ($scope.postImage.toString().length <= 32) ){
            web3Service.createPost($scope.tagSelected.address, $scope.postTitle, $scope.postImage, $scope.bytesArray);
        } else {
            console.log('Too much bytes');
        }
    };


}]);
