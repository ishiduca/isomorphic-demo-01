var xtend = require('xtend')

var core = {
  jsonrpc: '2.0',
  id: null
}

var request = xtend(core, {
  params: null,
  method: null
})

var response = xtend(core, { result: null })
var error = xtend(core, { error: null })

module.exports = {
  request, response, error
}
