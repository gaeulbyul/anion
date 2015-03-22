const API_URL = 'http://www.anissia.net/anitime';

var urlparser = require('url');
var config = require('../config');
var _ = require('underscore');

var request = require('request-promise').defaults({
	method: 'POST',
	json: true,
	encoding: 'UTF-8',
	headers: {
		'User-Agent': config.useragent || 'Ani-ON Crawler'
	}
});

var Anissia = {};

function processEpisode (ep) {
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

function processGenre (genre) {
	return _.uniq(
		genre.replace(/ /g, '').split(/\/|／/).map(function (g) {
			if (g == '어드벤쳐' || g == '모험') g = '어드벤처';
			if (g == '미스테리') g = '미스터리';
			if (g == '메카물') g = '메카닉';
			if (g == '학원물') g = '학원';
			if (g == '호러물') g = '호러';
			if (g == '연애') g = '로맨스';
			return g;
		}).filter(function (g, i, arr) {
			return g !== '';
		})
	);
}

Anissia.getAnilist = function getAnilist (weekday) {
	if (typeof weekday != 'number' || weekday < 0 || weekday > 8) {
		throw 'illegal weekday: '+weekday;
	}
	return request({
		uri: API_URL+'/list',
		qs: {w: weekday}
	}).then(function(resp) {
		if (resp.forEach) {
			resp.forEach(function(ani, ind) {
				ani.index = ind;
				ani.weekday = weekday;
				ani.id = ani.i;
				ani.title = ani.s;
				ani.time = ani.t;
				ani.ended = false;
				ani.genres = processGenre(ani.g);
				ani.homepage = 'http://' + ani.l.trim();
				ani.broaded = ani.a;
				ani.startdate = ani.sd;
				ani.enddate = ani.ed;
				'i s t g l a sd ed'.split(' ').forEach(function(k) {
					delete ani[k];
				});
			});
			return resp;
		} else {
			throw 'bad response';
		}
	});
	;
};

Anissia.getEndedAnilist = function getEndedAnilist (page) {
	return request({
		url: API_URL+'/end',
		qs: {p: page}
	}).then(function(resp){
		if (Array.isArray(resp)) {
				if (resp.length > 0) {
				resp.forEach(function(ani, ind) {
					ani.index = (page * 50) + ind;
					ani.id = ani.i;
					ani.title = ani.s.trim();
					ani.ended = true;
					ani.genres = processGenre(ani.g);
					ani.homepage = 'http://' + ani.l.trim();
					ani.startdate = ani.sd;
					ani.enddate = ani.ed;
					'i s t g l sd ed'.split(' ').forEach(function(k) {
						delete ani[k];
					});
				});
				return resp;
			} else {
				throw 'blank page';
			}
		} else {
			throw 'bad response';
		}
	});
};


Anissia.getAni = function getAni (id) {
	return request({
		uri: API_URL+'/cap',
		qs: {i: id}
	}).then(function(resp) {
		if (resp.forEach) {
			resp.forEach(function(ani) {
				ani.episode = processEpisode(ani.s);
				ani.updateat = ani.d;
				ani.url = 'http://' + ani.a.trim();
				var url_p = urlparser.parse(ani.url);
				if (!url_p.hostname
					|| url_p.hostname.indexOf('www.test.com') > 0
					|| url_p.hostname.indexOf('kor.sub') > 0
				) {
					ani.url = null;
				}
				ani.name = ani.n;
				's d a n'.split(' ').forEach(function(k) {
					delete ani[k];
				});
			});
			return resp;
		} else {
			throw 'bad response';
		}
	});
};


module.exports = Anissia;
