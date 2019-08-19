#!/usr/bin/env node
const app = require('../app')
const config = require('../config')

if (config.p_title) {
  process.title = config.p_title
}

app.set('port', config.port || 8081)

const server = app.listen(app.get('port'), 'localhost', () => {
  const msg = 'Express server listening on port ' + server.address().port
  console.log(msg)
})
