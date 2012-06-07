GITSHA := $(shell git rev-parse --short HEAD)

jukesy:
	lessc --compress ./public/less/bootstrap/bootstrap.less > ./public/jukesy.css
	cat ./public/js/lib/json2.js \
      ./public/js/lib/jquery-1.7.2.min.js \
      ./public/js/lib/underscore-min.js \
      ./public/js/lib/backbone.js \
      ./public/js/lib/swfobject.js \
      ./public/js/lib/moment-1.5.0.js \
      ./public/js/lib/jade.min.js \
      ./public/js/lib/bootstrap.js \
      ./public/js/boot.js \
      ./public/js/mixins.js \
      ./public/js/error.js \
      ./public/js/modal.js \
      ./public/js/user.js \
      ./public/js/session.js \
      ./public/js/lastfm.js \
      ./public/js/search.js \
      ./public/js/playlist.js \
      ./public/js/radio.js \
      ./public/js/shuffle.js \
      ./public/js/artist.js \
      ./public/js/album.js \
      ./public/js/track.js \
      ./public/js/tag.js \
      ./public/js/meow.js \
      ./public/js/welcome.js \
      ./public/js/video.js \
      ./public/js/keys.js \
      ./public/js/share.js \
      ./public/js/alert.js \
      ./public/js/application.js > ./public/jukesy.js
	uglifyjs -nc -nm -nmf ./public/jukesy.js > ./public/jukesy.min.js

clean:
	rm -f ./public/jukesy.min.js ./public/jukesy.js ./public/jukesy.css ./public/index.html

.PHONY: clean
