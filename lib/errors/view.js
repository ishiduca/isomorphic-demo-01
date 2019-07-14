var yo = require('yo-yo')
var {
  removeError
} = require('./actions')

module.exports = function (org) {
  return (model, actionsUp) => {
    var el = org.view(model, actionsUp)
    if (!model.errors.length) return el

    var errors = yo`<section><ul>${model.errors.map(f)}</ul></section>`
    el.appendChild(errors)
    return el

    function f (error) {
      var action = { type: removeError, value: error }
      return yo`<li><p><a onclick=${e => actionsUp(action)}>${error.message}</a></p></li>`
    }
  }
}
