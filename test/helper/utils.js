var Utils = {

  mock: {

    char: function() {
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return possible.charAt(Math.floor(Math.random() * possible.length));
    },

    name: function(length) {
      var name = '',
          length = length || 8;
      for (var i = 0; i < length; i++ ) {
        name += Utils.mock.char();
      }
      return name;
    },

    email: function() {
      return Utils.mock.name() + '@' + Utils.mock.name() + '.' + Utils.mock.name(3);
    },

  },

};

module.exports = Utils;
