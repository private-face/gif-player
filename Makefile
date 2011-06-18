RESOURCES = js/src/gif-movie.js\
			js/src/gif-player.js\
			js/src/gif-player-plugin.js

COMBINED = js/release/jquery.gif-player.js

MINIFIED = js/release/jquery.gif-player.min.js

$(COMBINED): $(RESOURCES)
	echo "(function($$) {" > $(COMBINED)
	cat js/src/gif-movie.js >> $(COMBINED)
	cat js/src/gif-player.js >> $(COMBINED)
	cat js/src/gif-player-plugin.js >> $(COMBINED)
	echo "})(jQuery);" >> $(COMBINED)

min: $(COMBINED)
	uglifyjs $(COMBINED) > $(MINIFIED)