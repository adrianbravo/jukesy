var assets = {

  js: [
    'js/lib/json2.js',
    'js/lib/underscore-min.js',
    'js/lib/backbone.js',
    'js/lib/backbone.localStorage.js',
    'js/lib/swfobject.js',
    'js/lib/less-1.1.3.min.js',
    'js/lib/jquery.mousewheel.js',
    'js/lib/mwheelIntent.js',
    'js/lib/jquery.jscrollpane.min.js',
    'js/boot.js',
    'js/modal.js',

    'js/mixins/tracks.js',
    'js/track.js',
    'js/search.js',
    'js/artist.js',
    'js/album.js',
    'js/tag.js',
    'js/user.js',

    'js/playlist.js',
    'js/nowplaying.js',

    'js/controls.js',
    'js/video.js',
    'js/application.js'
  ],

  css: [
    'css/lib/reset.css',
    'css/lib/jquery.jscrollpane.css'
  ],

  less: [
    'css/app.less'
  ]

};

exports.development = assets;
exports.test = assets;
exports.staging = assets;
exports.production = assets;
