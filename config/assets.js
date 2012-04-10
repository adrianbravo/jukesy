var assets = {

  js: [
    'js/lib/json2.js',
    'js/lib/underscore-min.js',
    'js/lib/backbone.js',
    'js/lib/swfobject.js',
    'js/lib/less-1.3.0.min.js',
    'js/lib/jade.min.js',
    'js/lib/bootstrap.js',
    'js/boot.js',
    'js/mixins.js',
    'js/error.js',
    'js/modal.js',

    'js/user.js',
    'js/session.js',
    'js/lastfm.js',
    'js/search.js',
    'js/playlist.js',
    'js/artist.js',
    'js/album.js',
    'js/track.js',
    'js/tag.js',
    'js/meow.js',

    'js/video.js',
    'js/keys.js',
    'js/application.js'
  ],

  less: [
    'less/bootstrap.less'
  ]

}

exports.development = assets
exports.production = assets
exports.staging = assets
exports.test = assets
