var fs = require('fs');
var cson = require('cursive');

var filename = __dirname + '/config.cson'

var cfg = {};
try {
	cfg = cson.parse(fs.readFileSync(filename));
} catch(e) {
	// use env-var
	cfg = {};
	cfg.port = process.env.ANION_PORT;
	cfg.mongodb_url = process.env.ANION_MONGODB;
	cfg.env = process.env.ANION_ENV;
}

module.exports = cfg;