var theBookGetABook = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      required: true
    }
  },
  required: true
}

var booklistGetBookList = {
  type: 'null',
  required: true
}

module.exports = {
  'theBook.getABook': theBookGetABook,
  'booklist.getBooklist': booklistGetBookList
}
