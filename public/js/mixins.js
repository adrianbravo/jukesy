Mixins.ViewFormErrors = {
  
  submit: function() {
    var sendJSON = {}
    _.each(this.$el.find('[name]'), function(inputEl) {
      var $input = $(inputEl)
      sendJSON[$input.attr('name')] = $input.val()
    })
    this.model.save(sendJSON, {
      success: this.submitSuccess,
      error: this.submitError
    })
    return false
  },
  
  submitError: function(model, error) {
    this.removeErrors()
    var errorJSON = {}
    try {
      errorJSON = JSON.parse(error.responseText)
    } catch(e) {}
    
    if (error.status == 401 && !errorJSON.errors) {
      this.addAlert('unauthorized')
    } else if (error.status) {
      this.addErrors(errorJSON.errors)
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
        var $group = self.$el.find('.controls [name=' + field + ']').parents('.control-group')
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
      $input = this.$el.find('.error:first [name]')
      if (!$input.length) {
        $input = this.$el.find('[name]:first')
      }
    }
    return $input
  }  

}
