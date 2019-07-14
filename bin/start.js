#!/usr/bin/env node
'use strict'
var app = require('../server')
var port = process.env.PORT || 3210
var msg = `server start to listen on port [${port}]`
app.listen(port, console.log.bind(console, msg))
