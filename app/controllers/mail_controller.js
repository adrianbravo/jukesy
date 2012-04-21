module.exports = function(app) {

  var nodemailer = require('nodemailer')
  nodemailer.SMTP = { 
    host: 'localhost'
  }

  return {

    resetToken: function(user, next) {
      var link = app.set('base_url') + '/user/' + user.username + '/reset/' + user.reset.token

      if (app.set('env') == 'production' || app.set('env') == 'staging') {
        nodemailer.send_mail({
            sender  : '"Jukesy" <no-reply@jukesy.com>'
          , to      : user.email
          , subject : 'Reset your password'
          , html    : "<p>Hello, <a href=\"" + user.link() + "\">" + user.username + "</a>.</p>"
                	  + "<p>Jukesy received a request to reset the password for your account.</p>"
  			            + "<p>If you still wish to reset your password, you may use this link: <br>"
                    + "<a href=\"" + link + "\">" + link + "</a></p>"
                    + "<p>If your password does not need to be reset, simply ignore this message.</p>"
          , body    : "Hello, " + user.username + ". \n\n"
                	  + "Jukesy received a request to reset the password for your account. \n\n"
  			            + "If you still wish to reset your password, you may use this link: \n"
                    + link + "\n\n"
                    + "If your password does not need to be reset, simply ignore this message. \n\n"
        }, next)
      } else {
        next(false, true)
      }
    }
  }
}

