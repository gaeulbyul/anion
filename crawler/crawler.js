#!/usr/bin/env node

var Anissia = require('../lib/anissia');
var AniONDB = require('../model/aniondb');
var config = require('../config');
var Q = require('q');

var aniondb = new AniONDB(config.database);

function showError (prefix) {
	return function (err) {
		console.error('%s, %j', prefix, err);
	}
}

function crawlOneWeekday (weekday) {
	return Anissia.getAnilist(weekday)
		.then(function (anilist) {
			anilist.forEach(function (ani) {
				var genres = ani.genres.slice(0); // copy array;
				ani.genre = ani.genres.join();
				delete ani.genres;
				aniondb.Ani.upsert(ani)
					.then(function (/*ani*/) {
						genres.forEach(function (genre) {
							aniondb.Genre.create({
								ani_id: ani.id,
								genre: genre,
							}).error(showError('genre'));
						});
					}).error(showError('ani'))
				;;
			});
		})
	;;
}

/*
CREATE TABLE "ani_genres" (
	id INTEGER NOT NULL UNIQUE,
	ani_id INTEGER NOT NULL,
	genre TEXT NOT NULL,
	PRIMARY KEY(id)
);
 */

/* maybe later...
function crawlOneWeekday (weekday) {
	var p = Q.spread(
		Anissia.getAnilist(weekday),
		aniondb.Ani.findAll({
			ended: false,
			weekday: weekday,
		}), function (new_anilist, anilist) {
			anilist_ids = anilist.map(function (ani) {
				return ani.id;
			});
			new_anilist.forEach(function (ani) {
				if (anilist_ids.indexOf(ani.id) > 0) {
					aniondb.Ani.upsert(ani);
				}
			});
		});
	;;
	return p;
}
*/

aniondb.seq
.query('DELETE FROM ani; DELETE FROM ani_genres')
.then(function () {
	var result = Q();
	for (var weekday=0; weekday <= 8; weekday++) {
		result = result.then(crawlOneWeekday.bind(null,weekday));
	}
});
/*
n -> insert(upsert)
n a -> update(upsert)
  a -> remove
*/