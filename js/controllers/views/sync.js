angular.module('OCApp.controllers').controller('syncCtrl',['$scope','web3Service','session','$rootScope', function($scope, web3Service, session, $rootScope){

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

    $(document).on('change', '.btn-file :file', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    $(document).ready( function() {
        $('#selectGenesis').on('fileselect', function(event, numFiles, file) {
            $scope.genesisPath = this.files[0].path;
            $scope.$apply('genesisPath');
        });
        $('#selectChain').on('fileselect', function(event, numFiles, file) {
            $scope.chainDir = this.files[0].path;
            $scope.$apply('chainDir');
        });
    });

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

    if (localStorage.mineAccount)
        $scope.mineAccount = localStorage.mineAccount;

    if (localStorage.autoMine == "true")
        $scope.autoMine = true;

    if (localStorage.autoConnect == "true")
        $scope.autoConnect = true;

    web3Service.getNodeInfo(function(result){
        console.log(result);
        $scope.nodeInfo = result;
    });

    web3Service.getPeers(function(err,result){
        console.log(result);
        $scope.peersConnected = 0;
        if (result)
            $scope.peersConnected = result.length;
    });

    $scope.selectMineAccount = function(address){
        $scope.mineAccount = address;
    }

    $scope.$watchGroup(["mineAccount","autoMine","connectionHost","connectionPort","genesisPath","chainDir","verbosityLog","autoConnect"],function(newValues){
        localStorage.mineAccount = newValues[0];
        localStorage.autoMine = newValues[1];
        localStorage.connectionHost = newValues[2];
        localStorage.connectionPort = newValues[3];
        localStorage.genesisPath = newValues[4];
        localStorage.chainDir = newValues[5];
        localStorage.verbosityLog = newValues[6];
        localStorage.autoConnect = newValues[7];
    })

    $scope.startMining = function(){
        $scope.loading = true;
        web3Service.startMining($scope.mineAccount,$scope.mineThreads,function(err,result){
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

    $scope.connectionPort = "8545";
    $scope.connectionHost = "127.0.0.1";

    $scope.stopMining = function(){
        web3Service.stopMining();
        $scope.isMining = false;
    }

}]);
