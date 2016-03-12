var NwBuilder = require('nw-builder');

//Get arguments
var args = process.argv.slice(2);
var platforms = ['linux64','linux32','win32','win64','osx32', 'osx64'];
if (args.indexOf('-platforms') >= 0){
    platforms = [];
    for (var i = args.indexOf('-platforms'); i < args.length; i++)
        platforms.push(args[i]);
}


var nw = new NwBuilder({
    files: '/home/blackjak/Escritorio/OpenContent/**/**',
    platforms: platforms,
    version: '0.12.3',
    appName : 'OpenContent',
    zip: false
});

console.log('Starting builder')

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
