angular.module('OCApp.controllers').controller('settingsCtrl',['$scope', function($scope){

    var win = require("nw.gui").Window.get();

    $scope.devTools = function() {
        if (win.isDevToolsOpen())
            win.closeDevTools();
        else
            win.showDevTools();
    };
    
}]);
