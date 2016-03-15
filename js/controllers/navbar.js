
angular.module('OCApp.controllers').controller('navBarCtrl',['$scope', 'session', 'web3Service','$filter','$rootScope', function($scope, session, web3Service, $filter, $rootScope) {

    var win = require("nw.gui").Window.get();
    $scope.balance = 0;
    $scope.selectedAddress = "0x0000000000000000000000000000000000000000";
    $scope.selectedAccount = 0;

    $scope.loading = true;

    $scope.txsWaiting = [];
    if (localStorage.txsWaiting && localStorage.txsWaiting.toString().length > 1){
        if (localStorage.txsWaiting.toString().indexOf(",") > 0)
            $scope.txsWaiting = localStorage.txsWaiting.toString().split(",");
        else
            $scope.txsWaiting.push(localStorage.txsWaiting);
    }
    $scope.openBoard = function(board, page){
        $scope.loadView('home');
        $rootScope.$broadcast('boardChange', {
            "board" : board,
            "page" : page
        });
    };

    $rootScope.$on('appUpdate', function(event, data) {
        $scope.txsWaiting = data.txsWaiting;
        $scope.indexInfo = data.indexInfo;
        $scope.accounts = web3Service.getAccounts();
        session.loadAccounts($scope.accounts);
        if (($scope.account) && ($scope.account.address != "0x0000000000000000000000000000000000000000")){
            $scope.getAccountInfo();
            $scope.refreshBalance();
        }
        $scope.$apply('accounts');
        $scope.$apply('indexInfo');
        $scope.$apply('account');
        $scope.$apply('txsWaiting');
    });

    $scope.refreshAccount = function(){
        $scope.getAccountInfo();
        $scope.refreshBalance();
    };

    $scope.getAccountInfo = function(){
       var user = web3Service.getUserByAddress(session.account.address);
       user.boards = [];
       for (var i = 0; i < user.boards_size; i++) {
           var board_address = web3Service.getUserBoard(user.contract, i);
           var boardInfo = web3Service.getBoardInfo(board_address);
           user.boards.push({
               address : board_address,
               owner : boardInfo[0],
               name : $filter('hexToString')(boardInfo[1]),
               posts : parseInt(boardInfo[2]),
               users : parseInt(boardInfo[3])
           });
       }
       $scope.account = user;
       //$scope.$apply('account');
       session.loadAccount(user);
       $scope.loading = false;
   }

    $scope.newAddress = function() {
        $("#passwordModal").modal('show');
        $scope.modalSubmit = function(){
            web3Service.newAddress($scope.passModal);
            $("#passwordModal").modal('hide');
        }
    }

    $scope.selectAccount = function(index){
        $("#passwordModal").modal('show');
        $scope.modalSubmit = function(){
            if ($scope.autoUnlock){
                localStorage.defaultAddress = $scope.accounts[index];
                localStorage.defaultPassword = $scope.passModal;
            }
            $("#passwordModal").modal('hide');
            $scope.loading = true;
            console.log('Loading account index '+index);
            web3Service.unloackAccount($scope.accounts[index],$scope.passModal,function(err,result){
                if (err)
                    console.error(err);
                else {
                    localStorage.selectedAccount = index;
                    session.account.address = $scope.accounts[index];
                    $scope.selectedAccount = index;
                    $scope.selectedAddress = $scope.accounts[index];
                    $scope.getAccountInfo();
                    $scope.refreshBalance();
                }
            });
        }
    };

    $scope.autoUnlock = false;
    if (localStorage.autoUnlock == "true")
        $scope.autoUnlock = true;
    $scope.$watch('autoUnlock',function(newValue){
        localStorage.autoUnlock = newValue;
    })

    $scope.refreshBalance = function(){
        var balance = parseInt(web3Service.getBalance(session.account.address));
        session.account.balance = balance;
        $scope.balance = balance;
    }

    $scope.txsWaiting = web3Service.txsWaiting;
    $scope.indexInfo = web3Service.indexInfo;
    $scope.accounts = web3Service.getAccounts();
    session.loadAccounts($scope.accounts);
    if ($scope.autoUnlock){
        console.log('UNLOCK DEFAULT');
        web3Service.unloackAccount(localStorage.defaultAddress,localStorage.defaultPassword,function(err,result){
            $scope.loading = false;
            if (err)
                console.error(err);
            else {
                for (var i = 0; i < $scope.accounts.length; i++) {
                    if ($scope.accounts[i] == localStorage.defaultAddress){
                        localStorage.selectedAccount = i;
                        $scope.selectedAccount = i;
                    }
                }
                session.account.address = localStorage.defaultAddress;
                $scope.selectedAddress = localStorage.defaultAddress;
                $scope.getAccountInfo();
                $scope.refreshBalance();
            }
        });
    } else {
        $scope.loading = false;
    }
    $scope.openBoard('0x0',0);

    $scope.reload = function (){
        win.reload();
    };

    /* DEV */

    window.compileIndex = function() {
        console.log("Compiling new index contract..");
        web3Service.createIndex(function(err,result){
            if (err)
                console.log(err);
            console.log(result);
            $scope.refreshAccount();
        })
    };

    window.onkeypress = function(e) {
        if (e.keyCode == 124)
            if (win.isDevToolsOpen())
                win.closeDevTools();
            else
                win.showDevTools();
    }
    win.showDevTools();

}]);
