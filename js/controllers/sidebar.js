angular.module('OCApp.controllers').controller('sidebarCtrl',['$scope','session','$rootScope', function($scope , session, $rootScope){
    $scope.isRegistered = false;

    $rootScope.$on('accountChange', function(event, data) {
        $scope.isRegistered = data.registered;
    });

}]);
