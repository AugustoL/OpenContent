angular.module('OCApp.controllers').controller('settingsCtrl',['$scope','web3Service', function($scope, web3Service){

    var win = require("nw.gui").Window.get();
    
    $scope.saveSettings = function(){

    }

    $scope.devTools = function() {
        if (win.isDevToolsOpen())
            win.closeDevTools();
        else
            win.showDevTools();
    };

}]);
