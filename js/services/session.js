angular.module( 'OCApp.services' ).factory('session', ['$rootScope', function($rootScope) {

    var service = {};

    service.registered = false;
    service.accounts = [];
    service.account = {
        address : "0x0000000000000000000000000000000000000000",
        balance : 0,
        username : "",
        name : "",
        email : "",
        location : "",
        birth : "",
        image : "",
        url1 : "",
        url2 : "",
        boards_size : 0,
        posts_size : 0
    };

    service.loadAccounts = function(accounts){
        service.accounts = accounts;
        console.log(service.accounts.length+" Accounts loaded");
    };

    service.loadAccount = function(user){
        service.account.contract = user.contract;
        service.account.username = user.username;
        service.account.name = user.name;
        service.account.email = user.email;
        service.account.location = user.location;
        service.account.birth = user.birth;
        service.account.image = user.image;
        service.account.url1 = user.url1;
        service.account.url2 = user.url2;
        service.account.boards_size = user.boards_size;
        service.account.posts_size = user.posts_size;
        service.account.boards = user.boards;
        if (service.account.username == "")
            service.account.registered = false;
        else
            service.account.registered = true;
        console.log("Account loaded: "+service.account.address);
    };

    return service;
}]);
