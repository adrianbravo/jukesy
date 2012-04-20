var nodemailer = require('nodemailer')

nodemailer.SMTP = { 
  host: 'localhost'
}

module.exports = nodemailer
