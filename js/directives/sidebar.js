angular.module('OCApp.directives').directive('sidebar', function () {
    return {
        restrict: 'C',
        templateUrl: 'app://opencontent/views/directives/sidebar.html',
        controller: 'sidebarCtrl'
    };
});
