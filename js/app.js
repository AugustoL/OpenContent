var app = angular.module('OCApp', ['OCApp.controllers','OCApp.directives','OCApp.services']);

//Controllers mudule
angular.module('OCApp.controllers', []);
//Services Module
angular.module('OCApp.services', []);
//Directives Module
angular.module('OCApp.directives', []);

app.filter('hexToString', function() {
    return function hex2a(hex) {
        var str = '';
        for (var i = 0; i < hex.length; i += 2) {
            var v = parseInt(hex.substr(i, 2), 16);
            if (v)
                str += String.fromCharCode(v);
        }
        return str;
    }
});
