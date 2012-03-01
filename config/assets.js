var assets = {

  js: [
    'js/lib/json2.js',
    'js/lib/underscore-min.js',
    'js/lib/backbone-min.js',
    'js/lib/swfobject.js',
    'js/lib/less-1.1.3.min.js',
    'js/lib/jade.min.js',
    'bootstrap/js/bootstrap.min.js',
    'js/boot.js',
    'js/mixins.js',
    'js/error.js',
    'js/modal.js',
    // ...
    'js/user.js',
    'js/session.js',
    // ...
    'js/video.js',
    'js/application.js'
  ],

  css: [
    'bootstrap/css/bootstrap.min.css',
  ],

  less: [
    'css/app.less'
  ]

}

exports.development = assets
exports.production = assets
exports.staging = assets
exports.test = assets
