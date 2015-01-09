#!/usr/bin/env node
var app = require('../app');
var config = require('../config');

if (config.p_title) {
	process.title = config.p_title;
}

app.set('port',  config.port || 8081);

var server = app.listen(app.get('port'), function() {
	var msg = 'Express server listening on port ' + server.address().port;
	console.log(msg);
});
