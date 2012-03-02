window.parseError = function(field, error) {
  var meta
  if (typeof error == 'object') {
    meta  = error[1]
    error = error[0]
  }
  
  switch (error) {
    case 'unauthorized':
    return 'You\'re not authorized to access that.'
    case 'no_connection':
      return 'There was an error connecting to the server. Please try again in a few minutes.'
    case 'bad_credentials':
      return 'Sorry, those credentials do not match any accounts on jukesy.'
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
  return 'Oops. Something went horribly wrong!'
}
