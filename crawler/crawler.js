#!/usr/bin/env node

var Anissia = require('../lib/anissia');
var AniONDB = require('../model/aniondb');
var config = require('../config');
var Q = require('q');

var aniondb = new AniONDB(config.database);

function crawlOneWeekday (weekday) {
	return Anissia.getAnilist(weekday)
		.then(function (anilist) {
			anilist.forEach(function (ani) {
				aniondb.Ani.upsert(ani);
			});
		});
	;;
}

aniondb.seq.query('DELETE FROM ani').then(function(){
	var result = Q();
	for (var weekday=0; weekday <= 8; weekday++) {
		result = result.then(crawlOneWeekday.bind(null,weekday));
	}
	//return result;
});