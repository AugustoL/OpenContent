var win = require("nw.gui").Window.get();
angular.module('OCApp.controllers').controller('navBarCtrl',['$scope', 'session', 'web3Service','$filter','$rootScope', function($scope, session, web3Service, $filter, $rootScope) {

    $scope.balance = 0;
    $scope.selectedAddress = "0x0000000000000000000000000000000000000000";
    $scope.selectedAccount = 0;
    $scope.isSync = false;

    $scope.txsWaiting = [];
    if (localStorage.txsWaiting && localStorage.txsWaiting.toString().length > 1){
        console.log(localStorage.txsWaiting);
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

    $rootScope.$on('txsChecked', function(event, data) {
        $scope.txsWaiting = data;
        $scope.getAccountInfo();
        $scope.refreshBalance();
        $scope.$apply('account');
        $scope.$apply('txsWaiting');
    });

    $rootScope.$on('indexLoaded', function(event, data) {
        $scope.accounts = web3Service.getAccounts();
        session.loadAccounts($scope.accounts);
        $scope.$apply('accounts');
        if ($scope.accounts && $scope.accounts[0])
            $scope.selectAccount(0);
        $scope.$apply('account');
        $scope.isSync = true;
        $scope.$apply('isSync');
        $scope.openBoard('0x0',0);
    });

    $scope.refreshAccount = function(){
        $scope.getAccountInfo();
        $scope.refreshBalance();
    };

    $scope.selectAccount = function(index){
        console.log('loadinga ccount index '+index);
        localStorage.selectedAccount = index;
        session.account.address = $scope.accounts[index];
        $scope.selectedAccount = index;
        $scope.selectedAddress = $scope.accounts[index];
        console.log($scope.selectedAccount);
        $scope.getAccountInfo();
        $scope.refreshBalance();
    };

    $scope.getAccountInfo = function(){
        var user = web3Service.getUserByAddress(session.account.address);
        user.tags = [];
        for (var i = 0; i < user.tags_size; i++) {
            var tag_address = web3Service.getUserTag(user.contract, i);
            var tagInfo = web3Service.getTagInfo(tag_address);
            user.tags.push({
                address : tag_address,
                name : $filter('hexToString')(tagInfo[0]),
                posts : parseInt(tagInfo[1]),
                users : parseInt(tagInfo[2])
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

    $scope.compile = function() {
        console.log("Compiling new index contract..");
        web3Service.createIndex(function(err,result){
            if (err)
                console.log(err);
            console.log(result);
            $scope.refreshAccount();
        })
    };
    $scope.reload = function (){
        win.reload();
    };
    $scope.devTools = function() {
        if (win.isDevToolsOpen())
            win.closeDevTools();
        else
            win.showDevTools();
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
