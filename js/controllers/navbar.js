
angular.module('OCApp.controllers').controller('navBarCtrl',['$scope', 'session', 'web3Service','$filter','$rootScope', function($scope, session, web3Service, $filter, $rootScope) {

    var win = require("nw.gui").Window.get();
    $scope.balance = 0;
    $scope.selectedAddress = "0x0000000000000000000000000000000000000000";
    $scope.selectedAccount = 0;

    $scope.loading = true;

    $scope.txsWaiting = [];

    $scope.openBoard = function(board, page){
        $scope.loadView('home');
        $rootScope.$broadcast('boardChange', {
            "board" : board,
            "page" : page
        });
    };

    $scope.debugClick = function(){
        web3Service.superDebug();
    };

    $rootScope.$on('appUpdate', function(event, data) {
        $scope.txsWaiting = data.txsWaiting;
        if (($scope.account) && ($scope.account.address != "0x0000000000000000000000000000000000000000")){
            $scope.getAccountInfo();
            $scope.refreshBalance();
            $scope.$apply('account');
        }
        $scope.$apply('accounts');
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
       session.loadAccount(user);
       $scope.loading = false;
   }

    $scope.newAddress = function() {
        $("#passwordModal").modal('show');
        $scope.modalSubmit = function(){
            $("#passwordModal").modal('hide');
            $scope.loading = true;
            web3Service.newAddress($scope.passModal,function(err){
                if (err){
                    $scope.loading = false;
                    $("#alerts").append("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>"+err.message.toString()+"</div>");
                } else {
                    $scope.accounts = web3Service.getAccounts();
                    session.loadAccounts($scope.accounts);
                    $scope.loading = false;
                }
            });

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
                if (err){
                    $("#alerts").append("<div class=\"alert alert-danger alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>"+err.message.toString()+"</div>")
                    $scope.loading = false;
                }else {
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

    $scope.indexInfo = web3Service.getIndexInfo();
    $scope.accounts = web3Service.getAccounts();
    session.loadAccounts($scope.accounts);
    if ($scope.autoUnlock){
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
