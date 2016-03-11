angular.module('OCApp.directives').directive('footer', function () {
    return {
        restrict: 'C',
        templateUrl: 'app://opencontent/views/directives/footer.html',
        scope: true,
        transclude : false
    };
});
