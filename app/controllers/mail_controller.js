module.exports = function(app) {

  var nodemailer = require('nodemailer')
  nodemailer.SMTP = { 
    host: 'localhost'
  }

  return {

    resetToken: function(user, next) {
      var link = app.set('base_url') + '/user/' + user.username + '/reset/' + user.reset.token

      if (app.set('env') == 'production') {
        nodemailer.send_mail({
            sender  : '"Jukesy" <no-reply@jukesy.com>'
          , to      : user.email
          , subject : 'Reset your password'
          , html    : "Greetings, " + user.username + ". \n\n"
              	  + "Jukesy is proud to inform you that your reset link has been created. It's a miracle of cryptography! \n\n"
			            + link + "\n\n"
                  + "Just fire that baby up. It will log you in and prompt you for a new password. \n\n"
                  + "Thank you for using Jukesy."
          , body    : "Greetings, " + user.username + ". \n\n"
              	  + "Jukesy is proud to inform you that your reset link has been created. It's a miracle of cryptography! \n\n"
			            + link + "\n\n"
                  + "Just fire that baby up. It will log you in and prompt you for a new password. \n\n"
                  + "Thank you for using Jukesy."
        }, next)
      } else {
        console.log(link)
        next(false, true)
      }
    }
  }
}

