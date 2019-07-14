var xtend = require('xtend')
var { through, pipe, concat } = require('mississippi')
// var {
//   response: rpcResponse,
//   error: rpcError
// } = require('./object')
var {
  JSONRPCRequest
} = require('./actions')

module.exports = function rpc (org, { api }) {
  return xtend(org, { update, run })

  function update (model, action) {
    if (action.type === JSONRPCRequest) {
      return { model, effect: action }
    }
    return org.update(model, action)
  }

  function run (effect, sources) {
    if (effect.type === JSONRPCRequest) {
      var json = effect.value
      if (Array.isArray(json)) {
        var proxy = through.obj()
        var i = 0
        var actions = []
        json.map(json => orgRun(json)).forEach(src => {
          i += 1
          pipe(
            src,
            concat(action => actions.push(action)),
            error => {
              if (error) console.error(error)
              if ((i -= 1) === 0) proxy.end(actions)
            }
          )
        })
        return proxy
      }
      return orgRun(json)
    }

    return org.run && org.run(effect, sources)

    function orgRun (json) {
      if (json instanceof Error) {
        var proxy = through.obj()
        process.nextTick(() => proxy.end({ type: 'error', value: json }))
        return proxy
      }

      return org.run({ type: json.method, value: json.params, data: json })
    }
  }
}
