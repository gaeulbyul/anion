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
				var genre = ani.genre;
				if (genre == '어드벤쳐' || genre == '모험') ani.genre = '어드벤처';
				if (genre == '미스테리') ani.genre = '미스터리';
				if (genre == '메카물') ani.genre = '메카닉';
				if (genre == '학원물') ani.genre = '학원';
				if (genre == '호러물') ani.genre = '호러';
				if (genre == '연애') ani.genre = '로맨스';
				aniondb.Ani.upsert(ani)
					.then(function (ani) {
						var genres = ani.genres;
						genres.forEach(function (genre) {
							a
							aniondb.Genre.create({
								ani_id: ani.id,
								genre: genre,
							});
						});
					})
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
.query('DELETE FROM ani')
.query('DELETE FROM ani_genres')
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