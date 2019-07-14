var window = require('global/window')
var jsonist = require('jsonist')
var { through } = require('mississippi')

var l = window.location
var prefix = `${l.protocol}//${l.host}/api`
var headers = {
  'content-type': 'application/json; charset=utf-8',
  'x-requested-with': 'XMLHttpRequest'
}

function post (data) {
  var s = through.obj()
  jsonist.post(prefix, data, { headers }, (err, json) => {
    if (err) return s.emit('error', err)
    if (json.error) s.emit('error', json.error)
    else s.end(json.result)
  })
  return s
}

module.exports = {
  'booklist.getBooklist' (maybeNull) {
    return post({
      jsonrpc: '2.0',
      id: `booklist.getBooklist--${Date.now()}`,
      method: 'booklist.getBooklist'
    })
  },
  'theBook.getABook' (params) {
    return post({
      jsonrpc: '2.0',
      id: `theBook.getABook--${Date.now()}`,
      method: 'theBook.getABook',
      params
    })
  }
}

//module.exports = {
//  'booklist.getBooklist' (maybeNull) {
//    var s = through.obj()
//    jsonist.get(getURL('/booklist.json'), { headers }, (err, json) => {
//      if (err) {
//        return s.emit('error', err)
//      }
//      s.end(json)
//    })
//    return s
//  },
//  'theBook.getABook' ({ id }) {
//    var s = through.obj()
//    jsonist.get(getURL('/booklist.json'), { headers }, (err, json) => {
//      if (err) return s.emit('error', err)
//      var n = json.booklist.map(b => b.id).indexOf(id)
//      if (n === -1) {
//        return s.emit('error', new Error(`theBook.getABook not found ${id}`))
//      } else {
//        s.end(json.booklist[n])
//      }
//    })
//    return s
//  }
//}
//
//function getURL (uri) {
//  var l = window.location
//  return [ l.protocol, '//', l.host, uri ].join('')
//}
