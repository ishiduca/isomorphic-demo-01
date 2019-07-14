var xtend = require('xtend')
var routington = require('routington')
var { pipe, through } = require('mississippi')

module.exports = function bindRoutes (org, _opt) {
  if (!org.routes) return org

  var opt = xtend(_opt)
  var router = opt.router
  var actionRender = Symbol('routes.actionRender')
  var actionHttpRequestGet = Symbol('routes.actionHttpRequestGet')
  var effectHttpRequestGet = Symbol('routes.effectHttpRequestGet')
  var render = m => (null)

  Object.keys(org.routes).map(route => {
    var node = router.define(route)[0]
    node.GET = (uri, actionsUp) => {
      render = (model, actionsUp) => (
        org.routes[route](uri, model, actionsUp)
      )
      actionsUp({ type: actionHttpRequestGet, value: uri })
    }
  })

  var linksRouter = routington()
  if (opt.links) {
    Object.keys(opt.links).map(route => {
      var node = linksRouter.define(route)[0]
      node.handlers = opt.links[route]
    })
  }

  return xtend(org, { view, update, run })

  function update (model, action) {
    if (action.type === actionHttpRequestGet) {
      return { model, effect: xtend(action, { type: effectHttpRequestGet }) }
    }
    if (action.type === actionRender) {
      return { model: xtend(model) }
    }
    return org.update(model, action)
  }

  function run (effect, sources) {
    if (effect.type === effectHttpRequestGet) {
      var s = through.obj()
      var m = linksRouter.match(effect.value.pathname)

      if (m == null) {
        process.nextTick(() => s.end({ type: actionRender }))
        return s
      }

      pipe(
        m.node.handlers.onRequest(xURL(effect.value, m.param)),
        through.obj((value, _, done) => {
          s.end(m.node.handlers.onResponse(value))
          done()
        }),
        onEnd
      )
      return s
    }

    return org.run && org.run(effect, sources)

    function xURL (uri, params) {
      uri.params = params
      return uri
    }

    function onEnd (err) {
      if (err) {
        console.error(err)
        s.end({ type: 'error', value: err })
      }
    }
  }

  function view (model, actionsUp) {
    return render(model, actionsUp)
  }
}
