var safe = require('json-stringify-safe')
var xtend = require('xtend')
var { error: _rpcResponseError } = require('./object')

module.exports = {
  httpRequestError,
  ParseError,
  InvalidRequestError,
  MethodNotFoundError,
  InvalidParamsError
}

function httpRequestError (req, res, error) {
  error = errorToJSON(error)
  res.statusCode = 400
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(safe(xtend(_rpcResponseError, { error })))
}

function ParseError (req, res, str) {
  var error = new Error('can not JSON.parse - show .data')
  error.name = 'ParseError'
  error.code = -32700
  error.data = str
  error = errorToJSON(error)
  res.statusCode = 400
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(safe(xtend(_rpcResponseError, { error })))
}

function InvalidRequestError (json, errors) {
  var error = new Error('Invalid Request')
  error.name = 'InvalidRequestError'
  error.code = -32600
  error.data = { errors, json }
  error = errorToJSON(error)
  return error
}

function MethodNotFoundError (json) {
  var error = new Error('Method not found')
  error.name = 'MethodNotFoundError'
  error.code = -32601
  error.data = { json }
  error = errorToJSON(error)
  return error
}

function InvalidParamsError (json, schema) {
  var error = new Error('Invalid params')
  error.name = 'InvalidParamsError'
  error.code = -32602
  error.data = { json, schema }
  error = errorToJSON(error)
  return error
}

function errorToJSON (error) {
  error.toJSON || (error.toJSON = function _toJSON () {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      data: this.data,
      hint: this.hint
    }
  })
  return error
}
