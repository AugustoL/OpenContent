angular.module( 'OCApp.services' ).factory( 'web3Service', [ 'session', '$rootScope', '$filter','$http', function (session, $rootScope, $filter, $http) {

    var service = {};
    var fs = require( "fs" );
    $rootScope.loading = true;
    $rootScope.isConnected = false;

    if (!localStorage.txsWaiting || (localStorage.txsWaiting[0] == "undefined")){
        service.txsWaiting = [];
    }

    service.startGeth = function() {
        console.log('Starting geth');
        $rootScope.loading = true;
        var gethPath = "geth/geth";
        if (window.navigator.platform.indexOf('Windows') > -1)
            gethPath = "geth/geth.exe";
        var child = require('child_process').spawn(gethPath, [
        "--networkid", "1998165215114019841",
        "--genesis", localStorage.genesisPath,
        "--datadir", localStorage.chainDir,
        "--verbosity="+localStorage.verbosityLog,
        "--port", "30666",
        "--rpc", "--rpcaddr", localStorage.connectionHost,
        "--rpcport", localStorage.connectionPort,
        "--rpccorsdomain=http://localhost:80",
        "--rpcapi", "admin,eth,miner,net,personal,web3",
        "--nat", "any",
        "--ipcdisable",
        "--extradata", "OpenContent 0.1"
        ]);
        child.stdout.on('data', function(data){
            console.log(`${data}`);
        });
        child.stderr.on('data', function(data) {
            console.log(`${data}`);
        });
        child.on('close', function(code) {
            console.log(`child process exited with code ${code}`);
        });
        child.on('exit', function(code) {
            console.log(`child process exited.`);
        });
        localStorage.gethPid = child.pid;
        setTimeout( function() {
            web3.setProvider(new web3.providers.HttpProvider("http://"+localStorage.connectionHost+":"+localStorage.connectionPort));
            if (web3.currentProvider.isConnected()){
                console.log('Connected');
                loadContract();
                $rootScope.loading = false;
                service.getNodeInfo(function(nodeInfo) {
                    if (nodeInfo)
                        $http({
                            url: "http://augustolemble.com:3000/addOCNode",
                            method: 'POST',
                            params : {nodeURL : nodeInfo.enode}
                        }).then(function successCallback(response) {
                            if (response.data.success)
                                console.log("Peer URL added");
                            else
                                console.log("Peer URL already added");
                            addOCNodes();
                        }, function errorCallback(response) {
                            console.error(response);
                        });
                });
            }
        }, 5000 );
    }
    service.stopGeth = function() {
        console.log('Stopping geth');
        if (window.navigator.platform.indexOf('Windows') > -1){
            require('child_process').exec('Taskkill /PID '+localStorage.gethPid);
        } else {
            var pidof = require('child_process').execSync('pidof geth');
            console.log(pidof.toString());
            require('child_process').exec('kill -9 '+pidof.toString());
        }
        console.log('Disconnected');
        $rootScope.status = "disconnected";
    }

    function addOCNodes(){
        $http({
            url: "http://augustolemble.com:3000/getOCNodes",
            method: 'GET'
        }).then(function successCallback(response) {
            var nodesArray = response.data.nodes.split(";");
            console.log("Peers to add:",nodesArray);
            for (var i = 0; i < nodesArray.length; i++)
                if (nodesArray[i].toString().length > 1)
                    service.addPeer(nodesArray[i].toString());
        }, function errorCallback(response) {
            console.error(response);
        });
    }

    service.getPeers = function(callback){
        postGeth('admin_peers',[],function(err,result){
            if (err)
                callback(err)
            else
                callback(null,result);
        });
    }

    // Web3
    var web3 = null;
    if (window.web3){
        web3 = window.web3;
    } else{
        var Web3 = require("web3");
        web3 = new Web3();
    }
    $rootScope.status = "disconnected";
    web3.setProvider(new web3.providers.HttpProvider("http://"+localStorage.connectionHost+":"+localStorage.connectionPort));
    if (web3.currentProvider.isConnected()){
        loadContract();
    } else if (localStorage.autoConnect == "true") {
        service.startGeth();
    }

    web3.eth.isSyncing(function(error, sync){
        if (err)
            console.error(err);
        if(!error) {
            if(sync === true) {
                console.log("Reset sync");
               web3.reset(true);
            } else if(sync) {
                console.log("Sync info:");
                console.log(sync);
            } else {
                console.log('Restarting geth');
                if (window.navigator.platform.indexOf('Windows') > -1){
                    require('child_process').exec('Taskkill /PID '+localStorage.gethPid, function(err){
                        if (!err)
                            service.startGeth();
                        else
                            console.error(err);
                    });
                } else {
                    require('child_process').exec('kill -9 '+localStorage.gethPid, function(err){
                        if (!err)
                            service.startGeth();
                        else
                            console.error(err);
                    });
                }
            }
        }
    });

    service.txsWaiting = [];
    if (localStorage.txsWaiting && localStorage.txsWaiting.toString().length > 1){
        if (localStorage.txsWaiting.toString().indexOf(",") > 0)
            service.txsWaiting = localStorage.txsWaiting.toString().split(",");
        else
            service.txsWaiting.push(localStorage.txsWaiting);
    }

    service.unloackAccount = function(address,password,callback){
        postGeth('personal_unlockAccount',[address,password],function(err,result){
            if (err)
                callback(err)
            else
                callback(null,result);
        });
    };

    service.newAddress = function(password, callback){
        postGeth('personal_newAccount',[password],function(err,address){
            if (err)
                callback(err);
            else
                callback(null);
        })
    }

    service.createAccount = function(username){
        console.log("Creating account using "+session.account.address);
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).createUser.sendTransaction(
            username.toString(),
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    }

    service.isMining = function(callback){
        postGeth('eth_mining','',function(err,result){
            if (err){
                console.error(err);
                callback(false);
            } else{
                callback(result);
            }
        })
    }

    service.startMining = function(address,threads,callback){
        console.log("Miner started on address: "+address+"+, using "+threads+" threads");
        localStorage.mineThreads = threads;
        postGeth('eth_mining',[],function(err,r1){
            if (err)
                callback(err);
            else if (!r1){
                postGeth('miner_setEtherbase',[address],function(err,r2){
                    if (err)
                        callback(err);
                    postGeth('miner_start',[parseInt(threads)],function(err,r3){
                        if (err)
                            callback(err);
                        else{
                            $rootScope.status = 'mining';
                            callback(null,r3);
                        }
                    })
                })
            } else {
                callback("Already mining..");
            }
        })
    };

    service.stopMining = function(){
        postGeth('eth_mining',[],function(err,r1){
            if (err)
                console.error(err);
            else if (r1){
                postGeth('miner_stop',[parseInt(localStorage.mineThreads)],function(err,r2){
                    if (err)
                        console.error(err);
                    else
                        $rootScope.status = 'connected';
                })
            } else {
                console.log("No mining..");
            }
        })
    }

    function loadContract(){
        readContract(function( err, compiled, address){
            if (err)
                console.error(err);
            service.indexContract = JSON.parse(compiled);
            service.indexAddress = address;
            console.log("Index Contract address: "+service.indexAddress);
            web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).log().watch(function(error, result){
                console.log($filter('hexToString')(result.args.message));
            });
            web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).logInt().watch(function(error, result){
                console.log(parseInt(result.args.message));
            });
            web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).logAddress().watch(function(error, result){
                console.log(result.args.message);
            });
            var indexInfo = web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).getIndexInfo.call();
            var index_info = {
                version : $filter("hexToString")(indexInfo[0]),
                users : parseInt(indexInfo[1]),
                boards : parseInt(indexInfo[2]),
                posts : parseInt(indexInfo[3])
            };
            service.indexInfo = index_info;
            console.log("Index Info: Version "+index_info.version+" ; "+index_info.users+" Users ; "+index_info.boards+" Boards ; "+index_info.posts+" Posts");
            $rootScope.status = "connected";
            if (localStorage.autoMine == "true"){
                service.startMining(localStorage.mineAccount,localStorage.mineThreads,function(err,mining){
                    service.isMining(function(result) {
                        if (result)
                            $rootScope.status = "mining";
                        $rootScope.isConnected = true;
                        $rootScope.loading = false;
                        $rootScope.$broadcast('appUpdate', service);
                    })
                });
            } else {
                $rootScope.isConnected = true;
                $rootScope.loading = false;
                $rootScope.$broadcast('appUpdate', service);
            }
        });
    }

    service.getNodeInfo = function(callback){
        postGeth('admin_nodeInfo','',function(err,result){
            if (err){
                console.error(err);
                callback(false);
            } else{
                callback(result);
            }
        })
    }

    service.addPeer = function(peer, callback){
        postGeth('admin_addPeer',[peer],function(err,result){
            console.log(result);
            if (err){
                console.error(err);
                if (callback)
                    callback(err);
            } else if (callback)
                callback(null,result);
        })
    }

    service.toHex = function(string){
        return web3.toHex(string);
    }

    service.defaultAccount = function(){
        if (web3.currentProvider.isConnected())
            return web3.eth.defaultAccount;
        else
            return "0x0000000000000000000000000000000000000000";
    }

    service.getAccounts = function(){
        if (web3.currentProvider.isConnected())
            return web3.eth.accounts.toString().split(',');
        else
            return ["0x0000000000000000000000000000000000000000"];
    }

    service.getBalance = function(address){
        if (web3.currentProvider.isConnected())
            return (web3.eth.getBalance(address)*0.000000000000000001).toString();
        else
            return "0";
    }

    service.superDebug = function(){
        if (web3.currentProvider.isConnected()){
            console.log("#--------------------- DEBUG INFO ---------------------#");
            console.log("Version: ",web3.version);
            console.log("Coinbase: "+web3.eth.coinbase);
            console.log("Block: #"+web3.eth.blockNumber+", "+web3.eth.defaultBlock);
            console.log("Mining: "+web3.eth.mining);
            console.log("Hasrate: "+web3.eth.hashrate);
            console.log("Peers: "+web3.net.peerCount);
            console.log("Index code:");
            console.log(web3.eth.getCode(localStorage.indexAddress).toString().substring(0,200));
            console.log("#--------------------- ########## ---------------------#");
        } else {
            console.log("Not conencted to debug..")
        }
    }

    service.getUserByUsername = function (username) {
        var user_address = web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).getUserByUsername.call(username);
        return service.getUserByAddress(user_address);
    };

    service.getUserBoard = function (address, i) {
        return web3.eth.contract(service.indexContract.User.info.abiDefinition).at(address).getBoard.call(i);
    };

    service.getBoardInfo = function (address) {
        return web3.eth.contract(service.indexContract.Board.info.abiDefinition).at(address).getInfo.call();
    };

    service.getPostData = function(post_address) {
        var post_data = web3.eth.contract(service.indexContract.Post.info.abiDefinition).at(post_address).getData.call();
        var post_content = web3.eth.contract(service.indexContract.Post.info.abiDefinition).at(post_address).getContent.call();
        var content_string = "";
        for (var i = 0; i < post_content.length; i++)
            content_string = content_string + $filter('hexToString')(post_content[i]);
        return {
            address : post_address,
            author : service.getUserByAddress(post_data[0]).username,
            authorAddress : post_data[0],
            board : post_data[1],
            boardName : $filter('hexToString')(service.getBoardInfo(post_data[1])[1]),
            title : $filter('hexToString')(post_data[2]),
            image : $filter('hexToString')(post_data[3]),
            comments : parseInt(post_data[4]),
            up : parseInt(post_data[5]),
            down : parseInt(post_data[6]),
            block : parseInt(post_data[7]),
            number : parseInt(post_data[8]),
            content : content_string
        };
    };

    service.getPostComment = function (post_address, i) {
        var comment = web3.eth.contract(service.indexContract.Post.info.abiDefinition).at(post_address, i).getComment.call();
        return {
            author : service.getUserByAddress(comment[0]).username,
            block : parseInt(comment[1]),
            text : $filter('hexToString')(comment[2])+$filter('hexToString')(comment[3])+$filter('hexToString')(comment[4])
        };
    };

    service.getHomePost = function (i) {
        var post_address = web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).getHomePost.call(i);
        return service.getPostData(post_address);
    };

    service.getUserPost = function (address, i) {
        var post_address = web3.eth.contract(service.indexContract.User.info.abiDefinition).at(address).getPost.call(i);
        return service.getPostData(post_address);
    };

    service.getBoardPost = function (address, i) {
        var post_address = web3.eth.contract(service.indexContract.Board.info.abiDefinition).at(address).getPost.call(i);
        return service.getPostData(post_address);
    };

    service.getUserByAddress = function (address) {
        var user = {
            contract : "0x0000000000000000000000000000000000000000",
            username : "",
            name : "",
            email : "",
            location : "",
            birth : "",
            image : "",
            url1 : "",
            url2 : "",
            posts_size : 0,
            boards_size : 0
        }
        if (!web3.currentProvider.isConnected() || (!service.indexContract))
            return user;
        var contract = web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).getUserByAddress.call(address);
        if ((contract == "0x") || (contract == "0x0000000000000000000000000000000000000000"))
            return user;
        var data = web3.eth.contract(service.indexContract.User.info.abiDefinition).at(contract).getData.call();
        var profile = web3.eth.contract(service.indexContract.User.info.abiDefinition).at(contract).getProfile.call();
        user = {
            contract : profile[0],
            username : $filter('hexToString')(profile[1]),
            name : $filter('hexToString')(profile[2]),
            email : $filter('hexToString')(profile[3]),
            location : $filter('hexToString')(profile[4]),
            birth : $filter('hexToString')(profile[5]),
            image : $filter('hexToString')(profile[6]),
            url1 : $filter('hexToString')(profile[7]),
            url2 : $filter('hexToString')(profile[8]),
            boards_size : parseInt(data[3]),
            posts_size : parseInt(data[4])
        }
        return user;
    };

    service.getIndexInfo = function(){
        return web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).getIndexInfo.call();
    };

    service.addComment = function (post_address, text) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).addComment.sendTransaction(
            post_address.toString(),
            text[0].toString(),
            text[1].toString(),
            text[2].toString(),
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.editUser = function (name, email, location, birth, urlimg, urlone, urltwo) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).editUser.sendTransaction(
            web3.toHex(name.toString()),
            web3.toHex(email.toString()),
            web3.toHex(urlimg.toString()),
            web3.toHex(birth.toString()),
            web3.toHex(location.toString()),
            web3.toHex(urlone.toString()),
            web3.toHex(urltwo.toString()),
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.deleteUser = function () {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).deleteUser.sendTransaction(session.account.address,{ from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.createBoard = function (name) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).createBoard.sendTransaction(
            web3.toHex(name.toString()),
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.createPost = function (board_address, title, image, bytesArray) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).createPost.sendTransaction(
            session.account.contract.toString(),
            board_address.toString(),
            web3.toHex(title.toString()),
            web3.toHex(image.toString()),
            bytesArray[0].toString(),
            bytesArray[1].toString(),
            bytesArray[2].toString(),
            bytesArray[3].toString(),
            bytesArray[4].toString(),
            bytesArray[5].toString(),
            bytesArray[6].toString(),
            bytesArray[7].toString(),
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log('New post sent');
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.giveUp = function(post_address) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).giveUp.sendTransaction(
            post_address,
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log('Give up sent');
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.giveDown = function(post_address) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).giveDown.sendTransaction(
            post_address,
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log('Give up sent');
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.removeBoard = function(board_address) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).removeBoardOnUser.sendTransaction(
            board_address,
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log('Removing Board');
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.deleteBoard = function(board_address) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).removeBoard.sendTransaction(
            board_address,
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log('Deleting Board');
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.deletePost = function(post_address) {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).removePost.sendTransaction(
            post_address,
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log('Removing Post');
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.deleteAccount = function() {
        web3.eth.contract(service.indexContract.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).removeUser.sendTransaction(
            { from: session.account.address, gas : 1000000, to : localStorage.indexAddress },
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log('Deleting my user');
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    service.sendCoins = function(toAddress, amount) {
        web3.eth.sendTransaction({ from: session.account.address, gas : 1000000, to : toAddress ,value : web3.toWei(amount, "ether")},
            function(err, tx) {
                if (err)
                    console.error(err);
                console.log(amount+' sent to '+toAddress);
                console.log(tx);
                service.txsWaiting.push(tx);
                checkTxsWaiting();
            }
        );
    };

    function waitForTX(tx, callback) {
        var wait = setInterval( function() {
            if ( isTXMined(tx)) {
                clearInterval(wait);
                callback(null);
            }
        }, 1000 );
    }
    var txsWatingLength = +service.txsWaiting.length;
    function checkTxsWaiting(){

        localStorage.txsWaiting = service.txsWaiting[0];
        for (var i = 1; i < service.txsWaiting.length; i++)
            localStorage.txsWaiting =+ ","+service.txsWaiting[0].toString();

        if ((txsWatingLength > 0) || (service.txsWaiting.length > 0 )){
            console.log("Checking "+service.txsWaiting.length+" txs..");
            if (txsWatingLength != service.txsWaiting.length)
                $rootScope.$broadcast('appUpdate', service);
            txsWatingLength = service.txsWaiting.length;
            if (service.txsWaiting)
                for (var i = 0; i < service.txsWaiting.length; i++)
                    if (isTXMined(service.txsWaiting[i])){
                        service.txsWaiting.splice(i,1);
                        if (service.txsWaiting.length > 0){
                            localStorage.txsWaiting = service.txsWaiting[0];
                            for (var i = 1; i < service.txsWaiting.length; i++)
                                localStorage.txsWaiting =+ ","+service.txsWaiting[0].toString();
                        } else {
                            localStorage.txsWaiting = "";
                        }
                    }
            if (txsWatingLength != service.txsWaiting.length)
                $rootScope.$broadcast('appUpdate', service);
            txsWatingLength = service.txsWaiting.length;
        }
    }

    function isTXMined(tx){
        if (!web3.eth.getTransaction(tx))
            return true;
        var txBlock = web3.eth.getTransaction(tx).blockNumber;
        if ((txBlock != null) && (parseInt(txBlock) <= parseInt(web3.eth.blockNumber)))
            return true;
        else
            return false;
    }

    function readContract(callback){
        fs.readFile( "contracts/index.txt", function (err, contract) {
            if (err)
                callback(err) ;
            fs.readFile( "contracts/indexAddress.txt", function (err, address) {
                if (err)
                    callback(err) ;
                console.log("Contract loaded.");
                callback(null, contract.toString(), address.toString());
            });
        });
    }

    function compileContract(callback){
        fs.readFile( "contracts/index.sol", function (err, data) {
            if (err)
                callback(err) ;
            var w8 = setInterval( function() {
                if (!web3.eth.syncing) {
                    clearInterval(w8);
                    var compiled = web3.eth.compile.solidity( data.toString('utf-8') );
                    fs.writeFile('contracts/index.txt', JSON.stringify(compiled), function (err) {
                        if (err)
                            console.error(err);
                        console.log("Contract compiled.");
                        callback(compiled);
                    });
                }
            }, 1000 );
        });
    }

    service.createIndex = function(callback){
        compileContract(function(compiled){
            web3.eth.contract(compiled.OpenContentIndex.info.abiDefinition).new({ from : web3.eth.accounts[0], data : compiled.OpenContentIndex.code, gas : 5000000 }, function(err, contract){
                if(!err) {
                    if(!contract.address) {
                        console.log("Contract Index waiting to be mined...");
                    } else {
                        console.log("Contract Index mined! Address: " + contract.address);
                        localStorage.indexAddress = contract.address;
    					web3.eth.contract(compiled.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).log().watch(function(error, result){
                            console.log($filter('hexToString')(result.args.message));
    					});
                        web3.eth.contract(compiled.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).logInt().watch(function(error, result){
                            console.log(parseInt(result.args.message));
    					});
                        web3.eth.contract(compiled.OpenContentIndex.info.abiDefinition).at(localStorage.indexAddress).logAddress().watch(function(error, result){
                            console.log(result.args.message);
                        });
                        fs.writeFile('contracts/indexAddress.txt', contract.address, function (err) {
                            if (err) console.error(err);
                            console.log("Contract address saved.");
                            callback(null, "done");
                        });
                    }
                } else {
                    console.error(err.toString());
                    callback(err);
                }
            });
        });
    };

    setInterval( function() {
        if (web3.currentProvider.isConnected() && (service.txsWaiting[0] != "undefined"))
            checkTxsWaiting();
    }, 3000 );

    function postGeth(action ,params, callback){
        if (!localStorage.postGethID || (localStorage.postGethID == "NaN"))
            localStorage.postGethID = 0;
        localStorage.postGethID ++;
        var parameters = "";
        if (params.length == 1){
            parameters = "\""+params[0]+"\"";
        } else if (params.length > 1){
            parameters = "\""+params[0]+"\"";
            for (var i = 1; i < params.length; i++)
                parameters += ",\""+params[i]+"\"";
        }
        console.log('making postGeth: '+'{"jsonrpc":"2.0","method":"'+action+'","params":['+parameters+'],"id":'+localStorage.postGethID+'}');
        $http({
            url: "http://localhost:8545",
            method: 'POST',
            headers: {"Content-type": "application/json"},
            data: '{"jsonrpc":"2.0","method":"'+action+'","params":['+parameters+'],"id":'+localStorage.postGethID+'}'
        }).then(function successCallback(response) {
            if (response.data.error)
                callback(response.data.error);
            else
                callback(null, response.data.result)
        }, function errorCallback(response) {
            callback(response.data);
        });
    }

    return service;
}]);
