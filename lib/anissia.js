const urlparser = require('url')
const util = require('util')
const pkg = require('../package.json')
const _ = require('underscore')

const API_URL = 'https://www.anissia.net/anitime'
// ex: Ani-ON/2.3.3
const USER_AGENT = util.format('Ani-ON/%s', pkg.version)

const request = require('request-promise').defaults({
  method: 'POST',
  json: true,
  encoding: 'UTF-8',
  headers: {
    'User-Agent': USER_AGENT,
  },
})

const Anissia = {}

function parseJSON(data) {
  if (Array.isArray(data)) {
    return data
  }
  if (typeof data !== 'string') {
    throw "can't parse into json"
  }
  data = data.replace(/\t/g, '\\t')
  const json = JSON.parse(data)
  if (Array.isArray(json)) {
    return json
  } else {
    throw 'parsed but unexpected object'
  }
}

function processEpisode(ep) {
  if (ep.match(/\d{5}/)) {
    let result = ''
    const int = Number(ep.substr(0, 4))
    if (int === 9999) {
      return '완료'
    }
    const f = Number(ep.slice(-1))
    result += int
    if (f > 0) {
      result += '.' + f
    }
    return result
  } else {
    return ep
  }
}

function processGenre(genre) {
  return _.uniq(
    genre
      .replace(/ /g, '')
      .split(/\/|／/)
      .map(g => {
        if (g === '어드벤쳐' || g === '모험') g = '어드벤처'
        if (g === '미스테리') g = '미스터리'
        if (g === '메카물') g = '메카닉'
        if (g === '학원물') g = '학원'
        if (g === '호러물') g = '호러'
        if (g === '연애') g = '로맨스'
        if (g === '개그') g = '코미디'
        if (g === '추리물') g = '추리'
        if (g === '운동') g = '스포츠'
        if (g === '공포') g = '호러'
        return g
      })
      .filter(g => {
        return g !== ''
      })
  )
}

Anissia.getAnilist = function getAnilist(weekday) {
  if (typeof weekday !== 'number' || weekday < 0 || weekday > 8) {
    throw 'illegal weekday: ' + weekday
  }
  return request({
    uri: API_URL + '/list',
    qs: { w: weekday },
  }).then(resp => {
    const json = parseJSON(resp)
    json.forEach((ani, ind) => {
      ani.index = ind
      ani.weekday = weekday
      ani.id = ani.i
      ani.title = ani.s
      ani.time = ani.t
      ani.ended = false
      ani.genres = processGenre(ani.g)
      ani.homepage = ani.l.trim() || null
      ani.broaded = ani.a
      ani.startdate = ani.sd
      ani.enddate = ani.ed
      'i s t g l a sd ed'.split(' ').forEach(k => {
        delete ani[k]
      })
    })
    return json
  })
}

Anissia.getEndedAnilist = function getEndedAnilist(page) {
  return request({
    url: API_URL + '/end',
    qs: { p: page },
  }).then(resp => {
    const json = parseJSON(resp)
    json.forEach((ani, ind) => {
      ani.index = page * 50 + ind
      ani.id = ani.i
      ani.title = ani.s.trim()
      ani.ended = true
      ani.genres = processGenre(ani.g)
      ani.homepage = ani.l.trim() || null
      ani.startdate = ani.sd
      ani.enddate = ani.ed
      'i s t g l sd ed'.split(' ').forEach(k => {
        delete ani[k]
      })
    })
    return json
  })
}

Anissia.getAniCaptions = function getAniCaptions(id) {
  return request({
    uri: API_URL + '/cap',
    qs: { i: id },
  }).then(resp => {
    const json = parseJSON(resp)
    json.forEach(ani => {
      ani.episode = processEpisode(ani.s)
      ani.updateat = ani.d
      ani.url = ani.a.trim() || null
      if (ani.url) {
        const url_p = urlparser.parse(ani.url)
        if (
          !url_p.hostname ||
          url_p.hostname.indexOf('www.test.com') > 0 ||
          url_p.hostname.indexOf('kor.sub') > 0
        ) {
          ani.url = null
        }
      }
      ani.name = ani.n
      's d a n'.split(' ').forEach(k => {
        delete ani[k]
      })
    })
    return json
  })
}

module.exports = Anissia
