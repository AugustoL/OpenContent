angular.module('OCApp.controllers').controller('indexCtrl',['$scope','web3Service','$rootScope','$controller','session', function($scope, web3Service, $rootScope, $controller, session){

    $rootScope.$on('accountChange', function(event, data) {
        $scope.account = data;
    });
    $scope.addAlert = function(type, message) {
        $("#alerts").append("<div class=\"alert alert-"+type+" alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>"+message+"</div>")
    }

    //$scope.addAlert('warning', 'message');
    //$scope.addAlert('info', 'message');
    //$scope.addAlert('success', 'message');
    //$scope.addAlert('danger', 'message');
    $rootScope.loadView = function(view){
        $scope.account = session.account;
        $scope.accounts = session.accounts;
        if (view == 'home')
            $scope.loadingHome = true;
        $controller(view+'Ctrl',{$scope : $scope });
        $scope.viewSrc = "views/templates/"+view+".html";
        $scope.view = view;
        localStorage.view = view;
	};

    $scope.loadView("home");

    $scope.openPost = function(address){
        $scope.postAddress = address;
        $scope.loadView('post');
    }

    $scope.openUser = function(user){
        $scope.userSelected = user;
        $scope.loadView('user');
    }

}]);
