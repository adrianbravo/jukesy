JUKESY = ./public/jukesy.js
JUKESY_CSS = ./public/jukesy.css

#
# lessc & uglifyjs are required
#

jukesy:
	lessc --compress ./public/less/bootstrap.less > ./public/jukesy.css
	cat ./public/js/lib/json2.js ./public/js/lib/jquery-1.7.2.min.js ./public/js/lib/underscore-min.js ./public/js/lib/backbone.js ./public/js/lib/swfobject.js ./public/js/lib/moment-1.5.0.js ./public/js/lib/jade.min.js ./public/js/lib/bootstrap.js ./public/js/boot.js ./public/js/mixins.js ./public/js/error.js ./public/js/modal.js ./public/js/user.js ./public/js/session.js ./public/js/lastfm.js ./public/js/search.js ./public/js/playlist.js ./public/js/radio.js ./public/js/artist.js ./public/js/album.js ./public/js/track.js ./public/js/tag.js ./public/js/meow.js ./public/js/welcome.js ./public/js/video.js ./public/js/keys.js ./public/js/application.js > ./public/jukesy.js
	uglifyjs -nc -nm -nmf ./public/jukesy.js > ./public/jukesy.min.js
	jade -p app/views -o '{ assets: { js: ["http://static1.jukesy.com/jukesy.min.js"], less: [], css: ["http://static2.jukesy.com/jukesy.css"] }, currentUser: {}, body: "", jadeLiteral: function(file) { return fs.readFileSync("app/views/" + file + ".jade", "utf8") } }' app/views/layout.jade --out public/
	mv public/layout.html public/index.html

clean:
	rm -f ./public/jukesy.min.js ./public/jukesy.js ./public/jukesy.css ./public/index.html

.PHONY: clean
