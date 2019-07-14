var yo = require('yo-yo')
var xtend = require('xtend')
var { through, pipe } = require('mississippi')
var api = require('./api')

function ups (obj) {
  return (model, action) => (
    typeof obj[action.type] === 'function'
      ? obj[action.type](model, action.value, action)
      : { model }
  )
}

module.exports = {
  init () {
    return {
      model: {
        booklist: [],
        theBook: {}
      },
      effect: {
        type: 'booklist.getBooklist'
      }
    }
  },
  update: ups({
    'booklist.setBooklist' (model, value, action) {
      return { model: xtend(model, { booklist: value.booklist }) }
    },
    'theBook.setABook' (model, value, action) {
      return { model: xtend(model, { theBook: value }) }
    }
  }),
  routes: {
    '/' (u, model, actionsUp) {
      return yo`
        <section>
          <ul>
          ${model.booklist.map(book => yo`
            <li>
              <p>
                <a href="/booklist/book/${book.id}">
                  <strong>${book.title}</strong>
                  (${book.author}/${book.contained})
                </a>
              </p>
            </li>
          `)}
          </ul>
        </section>
      `
    },
    '/booklist/book/:id' (u, model, actionsUp) {
      return yo`
        <section>
          <header>
            <h1>${model.theBook.title}</h1>
            <p>.params.id: ${u.params.id}</p>
          </header>
          <footer>
            <p><a href="/">booklist home</a></p>
          </footer>
        </section>
      `
    }
  },
  run: runDogs({
    'booklist.getBooklist' (value, effect) {
      var s = through.obj()
      pipe(
        api['booklist.getBooklist'](value),
        through.obj((value, _, done) => {
          s.write({ type: 'booklist.setBooklist', value, data: effect.data })
          done()
        }),
        err => {
          if (err) {
            // console.error(err)
            return s.end({ type: 'error', value: err })
          }
          s.end()
        }
      )
      return s
    },
    'theBook.getABook' (value, effect) {
      var s = through.obj()
      pipe(
        api['theBook.getABook'](value),
        through.obj((value, _, done) => {
          s.write({ type: 'theBook.setABook', value, data: effect.data })
          done()
        }),
        err => {
          if (err) {
            // console.error(err)
            return s.end({ type: 'error', value: err, data: effect.data })
          }
          s.end()
        }
      )
      return s
    }
  })
}

function runDogs (obj) {
  return (effect, sources) => (
    typeof obj[effect.type] === 'function' &&
      obj[effect.type](effect.value, effect, sources)
  )
}
