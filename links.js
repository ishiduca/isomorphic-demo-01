var api = require('./api')

module.exports = {
  '/booklist/book/:id': {
    onRequest (u) {
      return api['theBook.getABook']({ id: u.params.id })
    },
    onResponse (value) {
      return { type: 'theBook.setABook', value }
    }
  }
}
