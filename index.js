var express = require('express')
  , boot    = require('./config/boot')
  , app     = express.createServer()

module.exports = app

boot(app, function(err, results) {

  if (err) {
    return console.error('Error in boot process: ', err)
  }

  require('./routes')(app)

  app.listen(app.set('port').toString(), function() {
    console.log('[' + app.set('env') + '] jukesy is up:', 'http://' + app.set('host') + ':' + app.set('port') + '/')
  })

})
