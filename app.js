const path = require('path')
const express = require('express')
const morgan = require('morgan')
const _ = require('underscore')
const Sequelize = require('sequelize')

const AniONDB = require('./model/aniondb')
const Anissia = require('./lib/anissia')

const config = require('./config')

const app = express()

app.set('trust proxy', true)
app.set('env', config.env)

app.use(morgan('dev')) // logger

app.use(express.static(path.join(__dirname, 'public')))

const aniondb = new AniONDB(config.database)

// anion.herokuapp.com에선 HTTPS 버전으로 리다이렉트
// http://stackoverflow.com/a/23894573
if (app.get('env') === 'production') {
  app.use((req, res, next) => {
    const hostname = req.get('Host')
    if (
      req.headers['x-forwarded-proto'] !== 'https' &&
      hostname === 'anion.herokuapp.com'
    ) {
      return res.redirect(301, ['https://', hostname, req.url].join(''))
    }
    return next()
  })
}

const route = express.Router()

route.get('/', (req, res) => {
  res.status(200).sendFile('index.html', {
    root: __dirname + '/views',
  })
})

route.get('/api/anilist', (req, res) => {
  const weekday = /\d+/.test(req.query.weekday)
    ? Number(req.query.weekday)
    : new Date().getDay()
  const page = 'page' in req.query ? Number(req.query.page) : 1
  const dbquery = {
    offset: 30 * (page - 1),
    limit: 30,
  }
  if (req.query.search) {
    const lowerTitleCol = Sequelize.fn('lower', Sequelize.col('title'))
    const lowerTitle = Sequelize.fn('lower', `%${req.query.search}%`)
    dbquery.where = Sequelize.where(lowerTitleCol, ' LIKE ', lowerTitle)
    dbquery.order = ['weekday', 'index']
  } else if (req.query.genre) {
    dbquery.where = {
      genre: {
        $like: '%' + req.query.genre + '%',
      },
    }
    dbquery.order = ['weekday', 'index']
  } else {
    if (weekday < 9) {
      dbquery.where = {
        weekday: weekday,
        ended: false,
      }
      dbquery.order = ['index', 'weekday']
    } else {
      dbquery.where = {
        ended: true,
      }
      dbquery.order = ['index']
    }
  }
  aniondb.Ani.findAndCountAll(dbquery).then(anis => {
    const result = {
      result: anis.rows,
      count: anis.count,
    }
    return res.status(200).json(result)
  })
})

route.get('/api/genres', (req, res) => {
  aniondb.seq
    .query('SELECT DISTINCT "genre" FROM "ani_genres"', {
      type: AniONDB.Sequelize.QueryTypes.SELECT,
    })
    .then(genres => {
      return res.status(200).json(_.pluck(genres, 'genre'))
    })
})

route.get('/api/ani', (req, res) => {
  const aniID = req.query.id
  if (!/^\d+$/.test(aniID)) {
    return res.status(400).json({ error: 'invalid id!' })
  }
  aniondb.Ani.find({
    where: { id: aniID },
  }).then(
    ani => {
      return res.status(200).json(ani)
    },
    err => {
      console.error(err)
      return res.status(500)
    }
  )
})

route.get('/api/cap', (req, res) => {
  const aniID = req.query.id
  if (!/^\d+$/.test(aniID)) {
    return res.status(400).json({ error: 'invalid id!' })
  }
  Anissia.getAniCaptions(aniID).then(ani => {
    return res.status(200).json(ani)
  })
})

app.use(route)

app.use((err, req, res) => {
  let resp
  if (app.get('env') === 'development') {
    resp = {
      error: err,
      message: err.message,
    }
  } else {
    resp = {
      error: '',
      message: 'Error occured',
    }
  }
  return res.status(500).json(resp)
})

module.exports = app
