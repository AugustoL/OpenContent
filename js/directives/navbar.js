angular.module('OCApp.directives').directive('navbar', function () {
    return {
        restrict: 'C',
        templateUrl: 'app://opencontent/views/directives/navbar.html',
        controller: 'navBarCtrl'
    };
});
