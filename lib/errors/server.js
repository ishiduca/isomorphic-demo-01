var xtend = require('xtend')
var { through } = require('mississippi')
var _view = require('./view')
var {
  scheduleRemoveError,
  removeError
} = require('./actions')

module.exports = function (org) {
  return xtend(org, { init, update, view: _view(org), run })

  function init () {
    var state = org.init()
    var model = xtend(state.model, { errors: [] })
    return (
      state.effect
        ? { model, effect: state.effect }
        : { model }
    )
  }

  function update (model, action) {
    if (action.type === removeError) {
      var errors = model.errors.filter(e => e !== action.value)
      return { model: xtend(model, { errors }) }
    }

    if (action instanceof Error) return appendError(action)
    if (action.type === 'error') return appendError(action.value)

    return org.update(model, action)

    function appendError (error) {
      return {
        effect: { type: scheduleRemoveError, value: error },
        model: xtend(model, { errors: model.errors.concat(error) })
      }
    }
  }

  function run (effect, sources) {
    if (effect.type === scheduleRemoveError) {
      var s = through.obj()
      setTimeout(() => {
        s.end({ type: removeError, value: effect.value })
      }, 1000)
      return s
    }

    return org.run && org.run(effect, sources)
  }
}
