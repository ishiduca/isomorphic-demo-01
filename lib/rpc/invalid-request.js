var xtend = require('xtend')
var valid = require('is-my-json-valid')
var schema = require('./jsonrpc-request')
var {
  InvalidRequestError,
  MethodNotFoundError,
  InvalidParamsError
} = require('./errors')

// module.exports = function (next) {
//   var v = valid(schema)
//
//   return (json, actionsUp) => {
//     Array.isArray(json)
//       ? next(json.map(test), actionsUp)
//       : next(test(json), actionsUp)
//
//     function test (json) {
//       if (!v(json, { verbose: true })) {
//         return InvalidRequestError(json, v.errors)
//       }
//       return json
//     }
//   }
// }

module.exports = function (next, { api, schemas }) {
  var v = valid(schema)
  var vs = Object.keys(schemas)
    .map(method => ({ [method]: valid(schemas[method]) }))
    .reduce((a, b) => xtend(a, b), {})

  return (json, actionsUp) => {
    if (Array.isArray(json)) {
      next(json.map(test).map(methodNotFound).map(invalidParams), actionsUp)
    } else {
      next(invalidParams(methodNotFound(test(json))), actionsUp)
    }

    function test (json) {
      if (!v(json, { verbose: true })) {
        return InvalidRequestError(json, v.errors)
      }
      return json
    }

    function methodNotFound (json) {
      if (json instanceof Error) return json
      if (typeof api[json.method] !== 'function') {
        return MethodNotFoundError(json)
      }
      return json
    }

    function invalidParams (json) {
      if (json instanceof Error) return json
      if (!vs[json.method](json.params, { verbose: true })) {
        return InvalidParamsError(json, schemas[json.method])
      }
      return json
    }
  }
}
