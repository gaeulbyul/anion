var path = require('path');
var express = require('express');
var morgan = require('morgan');
var _ = require('underscore');

var AniONDB = require('./model/aniondb');
var Anissia = require('./lib/anissia');

var config = require('./config');

var app = express();

app.set('trust proxy', true);
app.set('env', config.env);

app.use(morgan('dev')); // logger

app.use(express.static(path.join(__dirname, 'public')));

var aniondb = new AniONDB(config.database);

// anion.herokuapp.com에선 HTTPS 버전으로 리다이렉트
// http://stackoverflow.com/a/23894573
if (app.get('env') === 'production') {
  app.use(function (req, res, next) {
    var hostname = req.get('Host');
    if (req.headers['x-forwarded-proto'] !== 'https' && hostname === 'anion.herokuapp.com') {
      return res.redirect(301, ['https://', hostname, req.url].join(''));
    }
    return next();
  });
}

var route = express.Router();

route.get('/', function (req, res){
  res.status(200).sendFile('index.html', {
    root: __dirname + '/views',
  });
});

route.get('/api/anilist', function (req, res, next) {
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
      'LOWER(title) LIKE LOWER(?)', '%' + req.query.search + '%',
    ];
    dbquery.order = ['weekday', 'index'];
  } else if (req.query.genre) {
    dbquery.where = {
      genre: {
        $like: '%' + req.query.genre + '%',
      },
    };
    dbquery.order = ['weekday', 'index'];
  } else {
    if (weekday < 9) {
      dbquery.where = {
        weekday: weekday,
        ended: false,
      };
      dbquery.order = ['index', 'weekday'];
    } else {
      dbquery.where = {
        ended: true,
      };
      dbquery.order = ['index'];
    }
  }
  aniondb.Ani.findAndCountAll(dbquery).then(function (anis) {
    var result = {
      result: anis.rows,
      count: anis.count,
    };
    return res.status(200).json(result);
  });

});

route.get('/api/genres', function (req, res, next) {
  aniondb.seq.query('SELECT DISTINCT "genre" FROM "ani_genres"', {
    type: AniONDB.Sequelize.QueryTypes.SELECT,
  }).then(function (genres) {
    return res.status(200).json(_.pluck(genres, 'genre'));
  });
});

route.get('/api/ani', function (req, res, next) {
  var aniID = req.query.id;
  if (!/^\d+$/.test(aniID)) {
    return res.status(400).json({error: 'invalid id!'});
  }
  aniondb.Ani.find({
    where: { id: aniID },
  }).then(function (ani) {
    return res.status(200).json(ani);
  }, function (err) {
    return res.status(500);
  });
});

route.get('/api/cap', function (req, res, next) {
  var aniID = req.query.id;
  if (!/^\d+$/.test(aniID)) {
    return res.status(400).json({error: 'invalid id!'});
  }
  Anissia.getAniCaptions(aniID)
    .then(function (ani) {
      return res.status(200).json(ani);
    });
});

app.use(route);

app.use(function (err, req, res, next) {
  var resp;
  if (app.get('env') === 'development') {
    resp = {
      error: err,
      message: err.message,
    };
  } else {
    resp = {
      error: '',
      message: 'Error occured',
    };
  }
  return res.status(500).json(resp);
});

module.exports = app;
