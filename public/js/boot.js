// Underscore mixins
_.mixin({
  capitalize: function(string) {
    if (!_.isString(string)) {
      string = ''
    }
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
  }
})

window.Collection = {}
window.Model = {}
window.View = {}
window.Mixins = {}


function cookieParser() {
  var ca = document.cookie.split(';')
    , len = ca.length
    , Cookies = {}

  for (var i = 0; i < len; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length)
    }

    var kv = c.split('=')
    try {
      var value = JSON.parse(unescape(kv[1]))
      Cookies[kv[0]] = value
    } catch(e) {
      Cookies[kv[0]] = kv[1]
    }
  }
  window.Cookies = Cookies
}
