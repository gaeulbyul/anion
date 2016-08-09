#!/usr/bin/env node

var Anissia = require('../lib/anissia');
var AniONDB = require('../model/aniondb');
var config = require('../config');
var Q = require('q');

var aniondb = new AniONDB(config.database);

function callback (db) {
  return function (newlist, dblist) {
    newlist.forEach(function (ani) {
      var genres = ani.genres.slice(0); // copy array;
      ani.genre = ani.genres.join();
      delete ani.genres;
      db.Ani.upsert(ani).then(function () {
        genres.forEach(function (genre) {
          aniondb.Genre.create({
            ani_id: ani.id,
            genre: genre,
          });
        });
      });
    });
  };
}

aniondb.seq.query('DELETE FROM ani_genres')
.then(function () {
  function crawlOneWeekday (weekday) {
    return Q.all([
      Anissia.getAnilist(weekday),
      aniondb.Ani.findAll({
        ended: false,
        weekday: weekday,
      }),
    ]).spread(callback(aniondb));
  }
  var result = Q();
  for (var weekday = 0; weekday <= 8; weekday++) {
    result = result.then(crawlOneWeekday.bind(null, weekday));
  }
  return result;
})
.then(function () {
  function crawlEndedOnePage (page) {
    return Q.all([
      Anissia.getEndedAnilist(page),
      aniondb.Ani.findAll({
        ended: true,
      }),
    ]).spread(callback(aniondb));
  }
  var result = Q();
  for (var page = 0; page <= 10; page++) {
    result = result.then(crawlEndedOnePage.bind(null, page));
  }
  return result;
});
