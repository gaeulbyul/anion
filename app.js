var path = require('path');
var express = require('express');
var morgan = require('morgan');
var config = require('./config');
var AniONDB = require('./model/aniondb');
var Anissia = require('./lib/anissia');

var app = express();

app.set('trust proxy', true);
app.set('env', config.env);

app.use(morgan('dev')); // logger

app.use(express.static(path.join(__dirname, 'public')));

AniONDB.connect(config.mongodb_url, true);

route = express.Router();

route.get('/', function showIndex(req, res){
	res.status(200).sendFile('index.html', {
		root: __dirname + '/views',
	});
});

route.get('/api/anilist', function(req, res, next) {
	var condi = {};
	if (req.query.search) {
		condi.search = req.query.search;
	} else {
		condi.weekday = (/\d+/.test(req.query.weekday))
			? Number(req.query.weekday)
			: new Date().getDay();
	}
	var page = 'page' in req.query ? Number(req.query.page) - 1 : 0;
	AniONDB.Ani.searchAni(condi, page, function(err, anis, count) {
		if (err) {
			return res.status(500);
		}
		var result = {
			result: anis,
			count: count,
		};
		return res.status(200).json(result);
	});
});

route.get('/api/ani', function(req, res, next) {
	var aniID = req.query.id;
	if (!/^\d+$/.test(aniID)) {
		return res.status(400).send('invalid!');
	}
	AniONDB.Ani.getAni(aniID, function (err, dat) {
		if (err) {
			return res.status(500);
		}
		return res.status(!!dat ? 200 : 404).json(dat);
	})
});

route.get('/api/cap', function(req, res, next) {
	var aniID = req.query.id;
	Anissia.getAni(aniID, function (err, body) {
		if (err) {
			return res.status(500).send(err);
		} else {
			return res.status(200).json(body);
		}
	});
});

app.use(route);

app.use(function errorHandler(err, req, res, next) {
	var resp;
	if (app.get('env') == 'development') {
		resp = {
			error: err,
			message: err.message
		};
	} else {
		resp = {
			error: '',
			message: 'Error occured'
		};
	}
	return res.status(500).json({message: err.message});
});

module.exports = app;