var fs = require('fs')
var path = require('path')
var http = require('http')
var ecstatic = require('ecstatic')(path.join(__dirname, './static'))
var { pipe } = require('mississippi')
var trumpet = require('trumpet')
var yo = require('yo-yo')
var { start } = require('@ishiduca/snoopy')
var multi = require('@ishiduca/snoopy-multi')
var errors = require('./lib/errors')
var hook = require('./lib/bind-routes/hook')
var bindRoutes = hook(require('./lib/bind-routes'))
var applyRpc = require('./lib/rpc/rpc')

var api = require('./api')
var schemas = require('./schemas')
var links = require('./links')
var org = require('./app')
var app = multi(applyRpc(errors(bindRoutes(org, { links })), { api }))
var { actions, views, effectActionsSources } = start(app)

// actions().on('data', action => console.log({ action }))

var Views = views()
function actionsUp (action) { actions().write(action) }

function work (req, res) {
  var tr = trumpet()
  var ws = tr.select('body').createWriteStream()

  Views.once('data', el => {
    ws.write(String(yo`<main>${el}</main>`))
    ws.end(`<script async defer src="/bundle.js"></script>`)
  })

  res.setHeader('content-type', 'text/html; charset=utf-8')

  pipe(
    fs.createReadStream(path.join(__dirname, 'static/index.html')),
    tr,
    res,
    onEnd
  )

  function onEnd (err) {
    if (err) {
      console.error(err)
      return res.end(`<main>${String(err)}</main>`)
    }
  }
}

var prefix = '/api'
var bindRpc = require('./lib/rpc/bind')
var rpcMiddleware = bindRpc({ api, schemas, prefix })
module.exports = http.createServer(
  rpcMiddleware({
    actionsUp,
    EffectActionsSources: effectActionsSources()
  },
  bindRoutes.middleware(
    ecstatic, { actionsUp }, work
  ))
)

if (!module.parent) {
  var port = process.env.PORT || 3210
  var msg = `server start to listen on port [${port}]`
  module.exports.listen(port, () => console.log(msg))
}
