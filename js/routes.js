
app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/', { templateUrl: 'app://opencontent/views/templates/home.html', controller : 'homeViewCtrl' });
    $routeProvider.when('/home.html', { templateUrl: 'app://opencontent/views/templates/home.html', controller : 'homeViewCtrl' });
    $routeProvider.when('/register', { templateUrl: 'app://opencontent/views/templates/register.html', controller : 'homeViewCtrl' });
    $routeProvider.when('/mining.html', { templateUrl: 'app://opencontent/views/templates/mining.html', controller : 'miningViewCtrl' });
    $routeProvider.when('/myUser.html', { templateUrl: 'app://opencontent/views/templates/myUser.html', controller : 'myUserViewCtrl' });
    $routeProvider.when('/post.html', { templateUrl: 'app://opencontent/views/templates/post.html', controller : 'postViewCtrl' });
    $routeProvider.when('/user.html', { templateUrl: 'app://opencontent/views/templates/user.html', controller : 'userViewCtrl' });
    $routeProvider.otherwise({redirectTo: '/'});

}]).config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode( true );
}]);
