angular.module('OCApp.controllers').controller('syncCtrl',['$scope','web3Service','session','$rootScope', function($scope, web3Service, session, $rootScope){

    $scope.minePassword = "";
    $scope.mineAccount  = "";
    $scope.connectionHost = "";
    $scope.connectionPort = "";
    $scope.genesisPath = "";
    $scope.chainDir = "";
    $scope.verbosityLog = 2;
    $scope.autoMine = false;
    $scope.autoConnect = false;
    $scope.syncForm = 'connect';
    $scope.isMining = false;
    $scope.peerToAdd = "";
    $scope.mineThreads = 1;

    if ($scope.status == 'mining')
        $scope.isMining = true;

    if (localStorage.genesisPath)
        $scope.genesisPath = localStorage.genesisPath;

    if (localStorage.chainDir)
        $scope.chainDir = localStorage.chainDir;

    if (localStorage.verbosityLog)
        $scope.verbosityLog = parseInt(localStorage.verbosityLog);

    if (localStorage.connectionPort)
        $scope.connectionPort = localStorage.connectionPort;

    if (localStorage.connectionHost)
        $scope.connectionHost = localStorage.connectionHost;

    if (localStorage.minePassword)
        $scope.minePassword = localStorage.minePassword;

    if (localStorage.mineAccount)
        $scope.mineAccount = parseInt(localStorage.mineAccount);

    if (localStorage.autoMine == "true")
        $scope.autoMine = true;

    if (localStorage.autoConnect == "true")
        $scope.autoConnect = true;

    web3Service.getNodeInfo(function(result){
        console.log(result);
        $scope.nodeInfo = result;
    });

    $scope.$watchGroup(["minePassword","mineAccount","autoMine","connectionHost","connectionPort","genesisPath","chainDir","verbosityLog","autoConnect"],function(newValues){
        localStorage.minePassword = newValues[0];
        localStorage.mineAccount = newValues[1];
        localStorage.autoMine = newValues[2];
        localStorage.connectionHost = newValues[3];
        localStorage.connectionPort = newValues[4];
        localStorage.genesisPath = newValues[5];
        localStorage.chainDir = newValues[6];
        localStorage.verbosityLog = newValues[7];
        localStorage.autoConnect = newValues[8];
    })

    $scope.startMining = function(){
        $scope.loading = true;
        web3Service.startMining(session.accounts[$scope.mineAccount],$scope.mineThreads,function(err,result){
            $scope.loading = false;
            if (err)
                console.error(err);
            else {
                console.log(result);
                $scope.isMining = true;
            }
        });
    }

    $scope.connect = function() {
        web3Service.startGeth();
    }

    $scope.addPeer = function() {
        web3Service.addPeer($scope.peerToAdd,function(err, result){
            if (err)
                $scope.addAlert('danger', 'Error: '+err.message.toString());
            else
                $scope.addAlert('success', 'Peer added');
        });
    }

    $scope.disconnect = function() {
        web3Service.stopGeth();
    }

    $scope.stopMining = function(){
        web3Service.stopMining();
        $scope.isMining = false;
    }

}]);
