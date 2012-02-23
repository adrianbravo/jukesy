module.exports = {
  
  ValidationError: function(e) {
    this.code = 400;
    this.message = 'Validation Error';
    this.errors = [];

    for (var i in e.errors) {
      var error = e.errors[i];
      this.errors.push({
        field: error.path,
        type: error.type
      });
    }

    if (this.errors.length == 0 && e.path && e.type) {
      this.errors.push({
        field: e.path,
        type: e.type
      });
    }

    Error.call(this, this.message);
  },

  BadRequest: function(msg) {
    this.code = 400;
    this.message = msg || 'Bad Request';
    Error.call(this, this.message);
  },

  Unauthorized: function(msg) {
    this.code = 401;
    this.message = msg || 'Unauthorized';
    Error.call(this, this.message);
  },
  
  Forbidden: function(msg) {
    this.code = 403;
    this.message = msg || 'Forbidden';
    Error.call(this, this.message);
  },
  
  NotFound: function(msg) {
    this.code = 404;
    this.message = msg || 'Not Found';
    Error.call(this, this.message);
  },

  Internal: function(msg) {
    this.code = 500;
    this.message = msg || 'Internal Server Error';
    Error.call(this, this.message);
  },
  
  NotImplemented: function(msg) {
    this.code = 501;
    this.message = msg || 'Not Implemented';
    Error.call(this, this.message);
  }

};

/*
Object.keys(module.exports).forEach(function(error) {
  module.exports[error].prototype.__proto__ = Error.prototype;
});
*/
