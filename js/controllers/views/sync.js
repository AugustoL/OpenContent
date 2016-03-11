angular.module('OCApp.controllers').controller('syncCtrl',['$scope','web3Service','session','$rootScope', function($scope, web3Service, session, $rootScope){

    $scope.passPath = web3Service.mining.passPath;
    $scope.genesisPath = web3Service.mining.genesisPath;
    $scope.chainDir = web3Service.mining.chainDir;
    $scope.verbosityLog = web3Service.mining.verbosityLog;
    $scope.mineAccount  = web3Service.mining.mineAccount;
    $scope.connectOnStart = false;
    $scope.mineForm = false;

    $scope.isMining = web3Service.isMining();

    $scope.$watchGroup(["passPath", "isMining", "mineAccount", "mineOnStart", "chainDir", "genesisPath", "verbosityLog"],function(newValues){
        localStorage.passPath = newValues[0];
        localStorage.isMining = newValues[1];
        localStorage.mineAccount = newValues[2];
        localStorage.mineOnStart = newValues[3];
        localStorage.chainDir = newValues[4];
        localStorage.genesisPath = newValues[5];
        localStorage.verbosityLog = newValues[6];
        web3Service.mining.passPath = newValues[0];
        web3Service.mining.isMining = newValues[1];
        web3Service.mining.mineAccount = newValues[2];
        web3Service.mining.mineOnStart = newValues[3];
        web3Service.mining.chainDir = newValues[4];
        web3Service.mining.genesisPath = newValues[5];
        web3Service.mining.verbosityLog = newValues[6];
    })

    $scope.startMining = function(){
        web3Service.startMining();
        $scope.isMining = true;
    }

    $scope.stopMining = function(){
        web3Service.stopMining();
        window.location.reload();
    }

}]);
