Mixins.ViewFormErrors = {
  
  submitError: function(model, error) {
    this.removeErrors()
    if (error.status) {
      this.addErrors(JSON.parse(error.responseText).errors)
    } else {
      this.addAlert()
    }
    this.focusInput()
  },
  
  addErrors: function(errors) {
    var self = this
    _.each(errors, function(error, field) {
      if (field == '$') {
        self.addAlert(error)
      } else {
        var $group = self.$el.find('input[name=' + field + ']').parents('.control-group')
        $group.addClass('error')
        $group.find('span.help-inline').html(parseError(field, error))
      }
    })
  },

  removeErrors: function() {
    this.$el.find('.error').removeClass('error')
    this.$el.find('.alert').remove()
    this.$el.find('span.help-inline').html('')
  },
  
  addAlert: function(message) {
    var $alert = new View.Alert({
          className: 'alert-error alert fade',
          message: parseError(null, message || 'no_connection')
        }).render()
      
    this.elAlertFind().prepend($alert)
    _.defer(function() {
      $alert.addClass('in')
    })
  },
  
  focusInput: function() {
    var self = this
    _.defer(function() {
      self.elFocusFind().focus()
    })
  },
  
  elAlertFind: function() {
    return this.elAlert ? this.$el.find(this.elAlert) : this.$el
  },
  
  elFocusFind: function() {
    var $input
    if (this.elFocus) {
      $input = this.$el.find(this.elFocus)
    } else {
      $input = this.$el.find('.error:first input')
      if (!$input.length) {
        $input = this.$el.find('input:first')
      }
    }
    return $input
  }  

}