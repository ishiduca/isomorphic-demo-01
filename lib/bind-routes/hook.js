var url = require('url')
var xtend = require('xtend')
var routington = require('routington')

module.exports = function hook (bindRoutes) {
  var router = routington()
  var hookBindRoutes = (org, opt) => {
    if (!org.routes) {
      org.routes = {
        '/' (u, model, actionsUp) {
          return org.view(model, actionsUp)
        }
      }
    }
    return bindRoutes(org, xtend(opt, { router }))
  }
  hookBindRoutes.middleware = middleware

  return hookBindRoutes

  function middleware (next, { actionsUp }, f) {
    return (req, res) => {
      var u = url.parse(req.url, true)
      var m = router.match(u.pathname)
      if (m == null) return next(req, res)
      if (m.node[req.method] == null) return methodNotAllowed()

      f(req, res)
      m.node[req.method](xURL(u, m.param), actionsUp)

      function methodNotAllowed () {
        var msg = `405 method not allowed - [${req.method}]`
        res.statusCode = 405
        res.end(msg)
      }

      function xURL (u, params) {
        u.params = params
        return u
      }
    }
  }
}
