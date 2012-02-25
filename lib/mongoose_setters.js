module.exports = {

  toLower: function(v) {
    return (v instanceof String || typeof v == 'string') && v.toLowerCase()
  }
  
}
