GITSHA := $(shell git rev-parse --short HEAD)

#
# lessc & uglifyjs are required
#

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
	jade -p app/views -o '{ env: "production", assets: { js: ["http://static1.jukesy.com/jukesy.min.js?${GITSHA}"], less: [], css: ["http://static2.jukesy.com/jukesy.css?${GITSHA}"], favicon: "http://static1.jukesy.com/favicon.ico?${GITSHA}" }, currentUser: {}, body: "", jadeLiteral: function(file) { return fs.readFileSync("app/views/" + file + ".jade", "utf8") }, Charts: JSON.stringify({ artists: JSON.parse(fs.readFileSync("public/chart/topartists.json")), tracks: JSON.parse(fs.readFileSync("public/chart/toptracks.json")) }), meta: { title : "jukesy - watch music videos", description : "Jukesy is an application that helps you watch music videos from YouTube. With Jukesy, you can create playlists, discover new music, listen to your favorite albums, and more.", image : "http://static2.jukesy.com/img/jukesy-256.png", type : "website", url : "http://jukesy.com" } }' app/views/layout.jade --out public/
	mv public/layout.html public/index.html

clean:
	rm -f ./public/jukesy.min.js ./public/jukesy.js ./public/jukesy.css ./public/index.html

.PHONY: clean
