angular.module('OCApp.controllers').controller('postCtrl',['$scope', 'web3Service', '$filter','$rootScope', function($scope, web3Service, $filter, $rootScope){

    console.log('loading post '+$scope.postAddress);
    $scope.postData = web3Service.getPostData($scope.postAddress);
    console.log($scope.postData);
    $scope.comments = [];
    for (var i = 0; i < $scope.postData.comments; i++) {
        $scope.comments.push(web3Service.getPostComment($scope.postAddress,i));;
    }
    $scope.newComment = "";
    $scope.addComment = function(){
        $scope.bytesArray = [];
        for (var i = 0; i < 3; i++)
            if ($scope.newComment.toString().match(/.{1,31}/g)[i])
                $scope.bytesArray.push( web3Service.toHex( $scope.newComment.toString().match(/.{1,31}/g)[i] ) );
            else
                $scope.bytesArray.push("0x0000000000000000000000000000000000000000000000000000000000000000");
        console.log($scope.bytesArray);
        if ($scope.newComment.toString().length <= 92){
            web3Service.addComment($scope.postAddress, $scope.bytesArray);
        } else {
            console.log('Too much bytes');
        }
    };

    $scope.giveDown = function(post_address){
        web3Service.giveDown(post_address);
    };
    $scope.giveUp = function(post_address){
        web3Service.giveUp(post_address);
    };

}]);
