const API_URL = 'http://www.anissia.net/anitime';
const USER_AGENT = 'Ani-ON Crawler (http://zn.oa.to/anion/)';

var request = require('request').defaults({
	method: 'POST',
	json: true,
	encoding: 'UTF-8',
	headers: {
		'User-Agent': USER_AGENT
	}
});

var Anissia = {};

function processEpisode(ep) {
	if (ep.match(/\d{5}/)) {
		var result = '';
		var int = Number(ep.substr(0,4));
		if (int == 9999) {
			return '완료';
		}
		var f = Number(ep.slice(-1));
		result += int;
		if (f > 0) {
			result += '.' + f;
		}
		return result;
	} else {
		return ep;
	}
}

Anissia.getAnilist = function getAnilist(weekday, callback) {
	if (typeof weekday != 'number' || weekday < 0 || weekday > 8) {
		throw 'illegal weekday: '+weekday;
	}
	request({
			url: API_URL+'/list',
			qs: {w: weekday}
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				if (!body.forEach) {
					console.warn('warning: bad response. i don\'t know why... (%d)', weekday);
					callback(null);
				}
				body.forEach(function(ani, ind) {
					ani.index = ind;
					ani.weekday = weekday;
					ani.id = ani.i;
					ani.title = ani.s;
					ani.time = ani.t;
					ani.ended = false;
					ani.genre = ani.g.replace(/ /g,'').split('/');
					ani.homepage = 'http://'.concat(ani.l.trim());
					ani.broaded = ani.a;
					ani.startdate = ani.sd;
					ani.enddate = ani.ed;
				});
				callback(null, body);
			} else {
				callback(error, null);
			}
		}
	);
};

Anissia.getAni = function getAni(id, callback) {
	request({
			url: API_URL+'/cap',
			qs: {i: id}
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				body.forEach(function(ani) {
					ani.episode = processEpisode(ani.s);
					ani.updateat = ani.d;
					ani.url = 'http://'.concat(ani.a.trim());
					if (ani.a.indexOf('www.test.com') != -1) {
						ani.url = null;
					}
					ani.name = ani.n;
				});
				callback(null, body);
			} else {
				callback(error, null);
			}
		}
	);
};

Anissia.getEndedAnilist = function getEndedAnilist(page, callback) {
	request({
			url: API_URL+'/end',
			qs: {p: page}
		}, function(error, response, body){
			if (!error && response.statusCode == 200) {
				body.forEach(function(ani, ind) {
					ani.index = (page*50) + ind;
					ani.id = ani.i;
					ani.title = ani.s;
					ani.ended = true;
					ani.genre = ani.g.replace(/ /g,'').split('/');
					ani.homepage = ani.l.trim();
					ani.startdate = ani.sd;
					ani.enddate = ani.ed;
				});
				callback(null, body);
			} else {
				callback(error, null);
			}
		});
};

module.exports = Anissia;