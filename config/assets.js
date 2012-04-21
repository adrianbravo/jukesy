var assets = {

  favicon: '/favicon.ico',
  js: [
    '/js/lib/json2.js',
    '/js/lib/jquery-1.7.2.min.js',
    '/js/lib/underscore-min.js',
    '/js/lib/backbone.js',
    '/js/lib/swfobject.js',
    '/js/lib/moment-1.5.0.js',
    '/js/lib/less-1.3.0.min.js',
    '/js/lib/jade.min.js',
    '/js/lib/bootstrap.js',
    '/js/boot.js',
    '/js/mixins.js',
    '/js/error.js',
    '/js/modal.js',

    '/js/user.js',
    '/js/session.js',
    '/js/lastfm.js',
    '/js/search.js',
    '/js/playlist.js',
    '/js/radio.js',
    '/js/shuffle.js',
    '/js/artist.js',
    '/js/album.js',
    '/js/track.js',
    '/js/tag.js',
    '/js/meow.js',
    '/js/welcome.js',

    '/js/video.js',
    '/js/keys.js',
    '/js/alert.js',
    '/js/application.js'
  ],
  less: [
    '/less/bootstrap.less'
  ],
  css: []

}

exports.development = assets
exports.staging = assets
exports.test = assets

exports.production = {
  favicon: '/favicon.ico',
  js: [ '/jukesy.min.js' ],
  css: [ '/jukesy.css' ],
  less: []
}
