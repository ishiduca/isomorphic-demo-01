var window = require('global/window')
var document = require('global/document')
var xtend = require('xtend')
var routington = require('routington')
var href = require('nanohref')
var { through, pipe } = require('mississippi')

module.exports = function (org, _opt) {
  if (!org.routes) return org

  var render = m => (null)
  var dummy = {}
  var opt = xtend({ notFound: _notFound }, _opt)
  var actionOnChangeHref = Symbol('routes.actionOnChangeHref')
  var effectBindRoutesType = Symbol('routes.effectBindRoutes')
  var effectBindRoutes = { type: effectBindRoutesType }

  var router = routington()
  Object.keys(org.routes).map(route => {
    var node = router.define(route)[0]
    node.render = (u, model, actionsUp) => (
      org.routes[route](u, model, actionsUp)
    )
  })

  var linksRouter = routington()
  if (opt.links) {
    Object.keys(opt.links).map(route => {
      var node = linksRouter.define(route)[0]
      node.handlers = opt.links[route]
    })
  }

  var u = new URL(window.location)
  changeRenderFunc(u, router.match(u.pathname))

  return xtend(org, { init, update, view, run })

  function update (model, action) {
    if (action.type === actionOnChangeHref) {
      return { model: xtend(model) }
    }
    return org.update(model, action)
  }

  function run (effect, sources) {
    if (effect.type === effectBindRoutesType) {
      var s = through.obj()
      href(node => {
        changeRenderFunc(node, router.match(node.pathname))
        window.history.pushState(dummy, '', node.pathname)
        s.write({ type: actionOnChangeHref, value: node })
        onLinks(node, s)
      })

      window.onpopstate = e => {
        var u = new URL(window.location)
        changeRenderFunc(u, router.match(u.pathname))
        s.write({ type: actionOnChangeHref, value: u })
        onLinks(u, s)
      }

      onLinks(new URL(window.location), s)

      return s
    }

    return org.run && org.run(effect, sources)

    function onLinks (u, s) {
      if (!opt.links) return
      var m = linksRouter.match(u.pathname)
      if (m == null) return

      pipe(
        m.node.handlers.onRequest(mURL(u, m.param)),
        through.obj((value, _, done) => {
          s.write(m.node.handlers.onResponse(value))
          done()
        }),
        err => {
          if (err) {
            console.error(err)
            return s.write({ type: 'error', value: err })
          }
        }
      )
    }
  }

  function init () {
    var state = org.init()
    var model = state.model
    var effect = (
      state.effect
        ? [].concat(state.effect).concat(effectBindRoutes)
        : effectBindRoutes
    )
    return { model, effect }
  }

  function view (model, actionsUp) {
    return render(model, actionsUp)
  }

  function changeRenderFunc (u, m) {
    render = (model, actionsUp) => (
      m == null
        ? opt.notFound(mURL(u, null), model, actionsUp)
        : m.node.render(mURL(u, m.param), model, actionsUp)
    )
  }

  function mURL (o, p) {
    o.params = p
    return o
  }
}

function _notFound (u, m, a) {
  var s = document.createElement('section')
  var p = document.createElement('p')
  var msg = `not found [${u.pathname}] :(`
  p.innerText = msg
  s.appendChild(p)
  return s
}
