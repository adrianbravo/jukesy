module.exports = {

  accessible: function(schema, accessible) {
    schema.methods.updateAttributes = function(attributes) {
      var self = this
      accessible.forEach(function(attribute) {
        if (typeof attributes[attribute] != 'undefined') {
          self[attribute] = attributes[attribute]
        }
      })
    }
  },

  timestamps: function(schema, options) {
    schema.add({
      time: {
        created: Date,
        updated: Date
      }
    })

    schema.pre('save', function (next) {
      if (this.isNew) {
        this.time.created = new Date
      }
      next()
    })

    schema.pre('save', function (next) {
      this.time.updated = new Date
      next()
    })

    if (options && options.index) {
      schema.path('time.created').index(options.index)
    }
  }

}
