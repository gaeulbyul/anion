var path = require('path');
var express = require('express');
var morgan = require('morgan');
var Q = require('q');

var AniONDB = require('./model/aniondb');
var Anissia = require('./lib/anissia');

var config = require('./config');

var app = express();

app.set('trust proxy', true);
app.set('env', config.env);

app.use(morgan('dev')); // logger

app.use(express.static(path.join(__dirname, 'public')));

var aniondb = new AniONDB(config.database);

var route = express.Router();

route.get('/', function showIndex(req, res){
	res.status(200).sendFile('index.html', {
		root: __dirname + '/views',
	});
});

route.get('/api/anilist', function(req, res, next) {
	var weekday = (/\d+/.test(req.query.weekday))
		? Number(req.query.weekday)
		: new Date().getDay();
	var page = 'page' in req.query ? Number(req.query.page) : 1;
	var dbquery = {
		offset: 30 * (page - 1),
		limit: 30,
	};
	if (req.query.search) {
		dbquery.where = [
			'LOWER(title) LIKE LOWER(?)', '%'+req.query.search+'%'
		];
		dbquery.order = ['weekday', 'index'];
	} else {
		if (weekday < 9) {
			dbquery.where = {
				weekday: weekday
			};
			dbquery.order = ['index', 'weekday'];
		} else {
			dbquery.where = {
				ended: true
			};
			dbquery.order = ['index'];
		}
	}
	aniondb.Ani.findAndCountAll(dbquery).then(function(anis) {
		var result = {
			result: anis.rows,
			count: anis.count,
		};
		return res.status(200).json(result);
	});

});

route.get('/api/ani', function(req, res, next) {
	var aniID = req.query.id;
	if (!/^\d+$/.test(aniID)) {
		return res.status(400).send('invalid!');
	}
	aniondb.Ani.find({
		where: { id: aniID }
	}).then(function (ani) {
		return res.status(200).json(ani);
	}, function (err) {
		return res.status(500);
	});
});

route.get('/api/cap', function(req, res, next) {
	var aniID = req.query.id;
	Anissia.getAni(aniID)
		.then(function (ani) {
			return res.status(200).json(ani);
		})
	;;
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
