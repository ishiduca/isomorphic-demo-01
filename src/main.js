var yo = require('yo-yo')
var document = require('global/document')
var multi = require('@ishiduca/snoopy-multi')
var errors = require('../lib/errors')
var bindRoutes = require('../lib/bind-routes')
var { start } = require('@ishiduca/snoopy')
// var org = require('../app')
var org = require('../app')
var links = require('../links')
var app = multi(errors(bindRoutes(org, { links })))
// var app = multi(bindRoutes(org))
var { views, models, actions } = start(app)

var root = document.body.firstElementChild
var tagName = root.tagName

views().on('data', el => {
  var newRoot = document.createElement(tagName)
  newRoot.appendChild(el)
  yo.update(root, newRoot)
})
models().on('data', m => console.log({ model: m }))
actions().on('data', a => console.log({ action: a }))
