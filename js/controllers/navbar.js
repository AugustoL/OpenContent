
angular.module('OCApp.controllers').controller('navBarCtrl',['$scope', 'session', 'web3Service','$filter','$rootScope', function($scope, session, web3Service, $filter, $rootScope) {

    var win = require("nw.gui").Window.get();
    $scope.balance = 0;
    $scope.selectedAddress = "0x0000000000000000000000000000000000000000";
    $scope.selectedAccount = 0;
    $scope.isSync = false;

    $scope.txsWaiting = [];
    if (localStorage.txsWaiting && localStorage.txsWaiting.toString().length > 1){
        if (localStorage.txsWaiting.toString().indexOf(",") > 0)
            $scope.txsWaiting = localStorage.txsWaiting.toString().split(",");
        else
            $scope.txsWaiting.push(localStorage.txsWaiting);
    }
    $scope.openBoard = function(board, page){
        $scope.loadingHome = true;
        $scope.posts = [];
        $scope.loadView('home');
        if (board == '0x0')
            $scope.viewSelected = 'home';
        else
            $scope.viewSelected = board;
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
        if ($scope.accounts && $scope.accounts[0])
            $scope.selectAccount(0);
        $scope.getAccountInfo();
        $scope.refreshBalance();
        $scope.isSync = true;
        $scope.$apply('accounts');
        $scope.$apply('indexInfo');
        $scope.$apply('account');
        $scope.$apply('isSync');
        $scope.$apply('txsWaiting');
    });

    $scope.refreshAccount = function(){
        $scope.getAccountInfo();
        $scope.refreshBalance();
    };

    $scope.selectAccount = function(index){
        console.log('Loading account index '+index);
        localStorage.selectedAccount = index;
        session.account.address = $scope.accounts[index];
        $scope.selectedAccount = index;
        $scope.selectedAddress = $scope.accounts[index];
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
    }

    $scope.refreshBalance = function(){
        var balance = parseInt(web3Service.getBalance(session.account.address));
        session.account.balance = balance;
        $scope.balance = balance;
    }

    $scope.txsWaiting = web3Service.txsWaiting;
    $scope.indexInfo = web3Service.indexInfo;
    $scope.accounts = web3Service.getAccounts();
    session.loadAccounts($scope.accounts);
    if ($scope.accounts && $scope.accounts[0])
        $scope.selectAccount(0);
    $scope.getAccountInfo();
    $scope.refreshBalance();
    $scope.isSync = true;
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
