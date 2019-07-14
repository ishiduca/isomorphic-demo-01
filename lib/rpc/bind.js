var url = require('url')
var safe = require('json-stringify-safe')
var xtend = require('xtend')
var routington = require('routington')
var { pipe, through, concat } = require('mississippi')
var post = require('./post')
var invalid = require('./invalid-request')
var {
  JSONRPCRequest
} = require('./actions')
var {
  response: rpcResponse,
  error: rpcError
} = require('./object')

module.exports = function bindRpcMiddleware (_opt) {
  var opt = xtend({ prefix: '/jsonrpc' }, _opt)
  var router = routington()
  var node = router.define(opt.prefix)[0]
  node.POST = post(
    invalid((json, actionsUp) => {
      actionsUp({ type: JSONRPCRequest, value: json })
    }, {
      api: opt.api,
      schemas: opt.schemas
    })
  )

  return ({
    actionsUp,
    EffectActionsSources
  }, next) => {
    return (req, res) => {
      var u = url.parse(req.url)
      var m = router.match(u.pathname)
      if (m == null) return next(req, res)
      if (m.node[req.method] == null) return next(req, res)

      EffectActionsSources.once('data', src => {
        res.setHeader('content-type', 'application/json; charset=utf-8')

        pipe(
          src,
          through.obj((action, _, done) => {
            var id = (action.data && action.data.id) || null
            if (action.type === 'error') {
              var error = errorToJSON(action.value)
              res.write(safe(xtend(rpcError, { error, id })))
              return done()
            }
            res.write(safe(xtend(rpcResponse, { result: action.value, id })))
            done()
          }),
          error => {
            if (error) {
              return res.end(safe(xtend(rpcError, { error: errorToJSON(error) })))
            }
            res.end()
          }
        )
      })

      m.node[req.method](req, res, actionsUp)
    }
  }
}

function errorToJSON (error) {
  error.toJSON || (error.toJSON = function () {
    return {
      name: this.name,
      message: this.message,
      code: this.code || -32700,
      data: this.data
    }
  })
  return error
}
