window.parseError = function(field, error) {
  var meta
  if (typeof error == 'object') {
    meta  = error[1]
    error = error[0]
  }
  
  switch (error) {
    case 'not_logged_in_save':
      return 'You must log in to save a playlist.'
    case 'not_logged_in_delete':
      return 'You must log in to delete a playlist.'
    case 'unauthorized':
      return 'You\'re not authorized to access that.'
    case 'no_connection':
      return 'There was an error connecting to the server. Please try again in a few minutes.'
    case 'bad_credentials':
      return 'Sorry, those credentials do not match any accounts on jukesy.'
    case 'no_user_or_email':
      return 'That user does not exist on jukesy.'
    case 'reset_token_expired':
      return 'That reset token is invalid or has expired.'
    case 'reset_password_required':
      return 'You cannot reset your password without a password.'
    case 'reset_password_unconfirmed':
      return 'The confirmed password does not match.'
    case 'required':
      return _.capitalize(field) + ' is required.'
    case 'too_long':
      return _.capitalize(field) + ' is too long (maxlength: ' + meta.maxlength + ').'
    case 'bad_format':
      return _.capitalize(field) + ' is not in a recognizable format.'
    case 'bad_characters':
      return _.capitalize(field) + ' only accepts alphanumeric characters (' + meta.characters + ').'
    case 'already_taken':
      return _.capitalize(field) + ' is already in use.'
  }
  return 'Sorry, there was an unknown error. If this persists, please contact us.'
}


;