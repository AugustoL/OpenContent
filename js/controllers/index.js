angular.module('OCApp.controllers').controller('indexCtrl',['$scope','web3Service','$rootScope','$controller','session', function($scope, web3Service, $rootScope, $controller, session){

    $scope.addAlert = function(type, message) {
        $("#alerts").append("<div class=\"alert alert-"+type+" alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>"+message+"</div>")
    }

    $rootScope.loadView = function(view,callback){
        $scope.account = session.account;
        $scope.accounts = session.accounts;
        if (view == 'home')
            $scope.loadingHome = true;
        $controller(view+'Ctrl',{$scope : $scope });
        $scope.viewSrc = "views/templates/"+view+".html";
        $scope.view = view;
        localStorage.view = view;
        if (callback)
            callback(true);
	};

    $scope.openPost = function(address){
        $scope.postAddress = address;
        $scope.loadView('post');
    }

    $scope.openUser = function(user){
        $scope.userProfile = web3Service.getUserByAddress(user);
        $scope.loadView('user');
    }

}]);
