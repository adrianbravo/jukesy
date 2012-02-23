var errorCodes = {
    400: 'Bad Request'
  , 401: 'Unauthorized'
  , 403: 'Forbidden'
  , 404: 'Not Found'
  , 500: 'Internal Error'
  , 501: 'Not Implemented'
}

module.exports = function(err, options) {
  if (typeof err == 'number') {
    this.code = err
    this.type = errorCodes[this.code] || 'Unknown'
  } else if (typeof err == 'object') {

    if (err.name != 'ValidationError') {
      this.code = 500
      this.type = errorCodes[500]
    } else {
      this.errors = {}
      this.code = 400
      this.type = 'Validation Error'

      for (var i in err.errors) {
        var modelError = err.errors[i]
        this.errors[modelError.path] = modelError.type
      }
    }
  }
  
  if (options) {
    this.errors = options
  }
  
  Error.call(this)
}
