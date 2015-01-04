var fs = require('fs');
var cson = require('cursive');

var filename = __dirname + '/config.cson'

var cfg = cson.parse(fs.readFileSync(filename));
module.exports = cfg;