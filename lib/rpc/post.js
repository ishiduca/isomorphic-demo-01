var bl = require('bl')
var {
  httpRequestError,
  ParseError
} = require('./errors')

module.exports = function post (next) {
  return (req, res, actionsUp) => {
    req.pipe(bl((error, raw) => {
      if (error) return httpRequestError(req, res, error)

      var str = String(raw)
      var json; try {
        json = JSON.parse(str)
      } catch (x) {
        return ParseError(req, res, str)
      }

      next(json, actionsUp)
    }))
  }
}
