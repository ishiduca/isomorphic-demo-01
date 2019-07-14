var fs = require('fs')
var path = require('path')
var { pipe, concat, through } = require('mississippi')

function JSONParseError (str) {
  var e = new Error(str)
  e.name = 'JSONParseError'
  e.data = str
  return e
}

module.exports = {
  'booklist.getBooklist' (maybeNull) {
    var s = through.obj()
    var booklistJson = path.join(__dirname, '../static/booklist.json')
    pipe(
      fs.createReadStream(booklistJson),
      concat(list => {
        var str = String(list)
        var json; try {
          json = JSON.parse(str)
        } catch (x) {
          return s.emit('error', JSONParseError(str))
        }
        return s.end(json)
      }),
      err => {
        if (err) {
          return s.emit('error', err)
        }
      }
    )
    return s
  },
  'theBook.getABook' ({ id }) {
    var s = through.obj()
    var booklistJson = path.join(__dirname, '../static/booklist.json')
    pipe(
      fs.createReadStream(booklistJson),
      concat(list => {
        var str = String(list)
        var json; try {
          json = JSON.parse(str)
        } catch (x) {
          return s.emit('error', JSONParseError(str))
        }
        var n = json.booklist.map(b => b.id).indexOf(id)
        if (n === -1) {
          s.emit('error', new Error(`theBook.getABook notFound ${id}`))
        } else {
          s.end(json.booklist[n])
        }
      }),
      err => {
        if (err) return s.emit('error', err)
      }
    )
    return s
  }
}
