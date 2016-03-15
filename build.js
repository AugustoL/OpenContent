var NwBuilder = require('nw-builder');

//Get arguments
var args = process.argv.slice(2);
var platforms = ['linux64','linux32','win32','win64','osx32', 'osx64'];
if (args.indexOf('-platforms') >= 0)
    platforms = args[args.indexOf('-platforms')+1].split(',');

var nw = new NwBuilder({
    files: '**/**',
    platforms: platforms,
    version: '0.12.3',
    appName : 'OpenContent',
    zip: false,
    forceDownload: false
});

console.log('Starting builder')

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
