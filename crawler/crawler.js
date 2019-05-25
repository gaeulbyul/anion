#!/usr/bin/env node

const Anissia = require('../lib/anissia')
const AniONDB = require('../model/aniondb')
const config = require('../config')
const Q = require('q')
const _ = require('lodash')

const aniondb = new AniONDB(config.database)

async function updateAni(ani) {
  const genres = ani.genres.slice(0)
  ani.genre = ani.genres.join()
  delete ani.genres
  await aniondb.Ani.upsert(ani)
  return aniondb.Genre.bulkCreate(
    genres.map(genre => ({
      genre,
      ani_id: ani.id,
    }))
  )
}

async function main() {
  await aniondb.seq.query('DELETE FROM ani_genres')
  // _.range is exclusive-range
  for (const weekday of _.range(9)) {
    const anissiaAnis = await Anissia.getAnilist(weekday)
    const dbAnis = await aniondb.Ani.findAll({
      where: {
        weekday,
        ended: false,
      },
    })
    for (const ani of anissiaAnis) {
      await updateAni(ani)
    }
  }
  for (const page of _.range(15)) {
    const anissiaAnis = await Anissia.getEndedAnilist(page)
    const dbAnis = await aniondb.Ani.findAll({
      where: {
        ended: true,
      },
    })
    for (const ani of anissiaAnis) {
      await updateAni(ani)
    }
  }
}

main()
