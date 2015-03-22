#!/usr/bin/env node

var Anissia = require('../lib/anissia');
var AniONDB = require('../model/aniondb');
var config = require('../config');
var Q = require('q');
var _ = require('underscore');

var aniondb = new AniONDB(config.database);

function showError (prefix) {
	return function (err) {
		console.error('%s, %j', prefix, err);
	};
}

var toRemove = [];

function callback (db) {
	return function (newlist, dblist) {
		var dblist_ids = _.pluck(dblist, 'id');
		newlist.forEach(function (ani) {
			dblist_ids = _.without(dblist_ids, ani.id);
			db.Ani.upsert(ani);
		});
		dblist_ids.forEach(function (id) {
			toRemove.push(id)
		});
	};
}

//aniondb.seq
//.query('DELETE FROM ani; DELETE FROM ani_genres')
Q()
.then(function () {
	function crawlOneWeekday (weekday) {
		return Q.all([
			Anissia.getAnilist(weekday),
			aniondb.Ani.findAll({
				ended: false,
				weekday: weekday,
			})
		]).spread(callback(aniondb));
	}
	var result = Q();
	for (var weekday=0; weekday <= 8; weekday++) {
		result = result.then(crawlOneWeekday.bind(null, weekday));
	}
	return result;
})
.then(function () {
	function crawlEndedOnePage (page) {
		return Q.all([
			Anissia.getEndedAnilist(page),
			aniondb.Ani.findAll({
				ended: true
			})
		]).spread(callback(aniondb));
	}
	var result = Q();
	for (var page=0; page <= 10; page++) {
		result = result.then(crawlEndedOnePage.bind(null, page));
	}
	return result;
})
.then(function () {
	toRemove.forEach(function (id) {
		console.info('should remove id %d', id);
		/*
		db.Ani.destroy({
			where: {id: toremove}
		});
		*/
	});
});
/*
n -> insert(upsert)
n d -> update(upsert)
  d -> remove
*/