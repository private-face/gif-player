(function($) {
	var GifMovie = function($preview, url) {
		this.__GifMovieInit.apply(this, arguments);
	};

	GifMovie.prototype.__GifMovieInit = function($preview, url) {
		this.$preview = $preview;

		this.$gif = null;
	
		this.url = url;
	
		this.__states = {
			loaded: false,
			loading: false,
			playing: false
		};

		var zindex = this.$preview.css('z-index');
		this.__zIndex = (zindex === 'auto' || zindex === 0 ? 10 : zindex);
	
		this.width = this.$preview[0].getAttribute('width') || this.$preview.width();
	
		this.height = this.$preview[0].getAttribute('height') || this.$preview.height();
	
		this.$preview.css({
			'position': 'relative',
			'z-index': this.__zIndex
		});
	};

	GifMovie.prototype.__createMovieElement = function() {
		this.$gif = $('<img src="about:blank" />')
						.attr({
							'width': this.width,
							'height': this.height
						})
						.css({
							'position': 'absolute',
							'z-index': this.__zIndex - 1
						})
						.insertAfter(this.$preview);
					
		return this.$gif;
	};

	GifMovie.prototype.state = function(key, value) {
		if (arguments.length === 1) {
			return this.__states[key];
		}

		var oldValue = this.__states[key];
		if (oldValue !== value) {
			this.__states[key] = value;
			this.onStateChange(key, value, oldValue);
		}
	
		return this;
	};

	GifMovie.prototype.onStateChange = function(key, value, oldValue) {
		// callback
	};

	GifMovie.prototype.load = function() {
		if (!this.state('loaded') && !this.state('loading')) {
			var self = this;
			var deferred = $.Deferred();

			self.state('loading', true);
		
			(this.$gif || this.__createMovieElement())
				.attr({
					'src': this.url
				})
				.unbind('.GifMovie')
				.bind('load.GifMovie', function(){
					self.state('loading', false);
					self.state('loaded', true);
					deferred.resolve();
				});
			
			return deferred.promise();
		}

		return this;
	};

	GifMovie.prototype.play = function() {
		var self = this;
	
		if (!this.state('playing')) {
		
			$.when(this.load()).done(function() {
				self.adjustMoviePosition();
				self.$gif.css({
					'z-index': self.__zIndex + 1
				});
			
				self.state('playing', true);
			});
		
		}
	
		return this;
	};

	GifMovie.prototype.stop = function() {
		if (this.state('playing') && this.state('loaded')) {
			this.$gif
				.unbind('.GifMovie')
				.attr('src', 'about:blank')
				.css('z-index', this.__zIndex - 1);
		
			this.state('loaded', false);
			this.state('playing', false);
		}
	
		return this;
	};

	GifMovie.prototype.adjustMoviePosition = function() {
		var preview = this.$preview[0];
		if (this.$gif) {
			this.$gif.css({
				'top': preview.offsetTop,
				'left': preview.offsetLeft
			});
		}
	
		return this;
	};
	var GifPlayer = function($el, options) {
		this.__GifPlayerInit.apply(this, arguments);
	};

	GifPlayer.prototype.__getMovieUrl = function() {
		if (typeof this._options.url === 'string' && $.trim(this._options.url) !== '') {
			return this._options.url;
		} else {
			var attrlist = ['href', 'src', 'rel', 'alt'];

			while (attrlist.length) {
				var url = $.trim(this._$element.attr(attrlist.shift()));
				if (url !== '') {
					return url;
				}
			}

		}
		throw "Unable to initailize player: can't get URL (tried to retrieve it from '" + attrlist.join("', '") + "' attributes).";
	};

	GifPlayer.prototype.__getMoviePreview = function() {
		var $preview = this._$element.find('img:eq(0)');

		if (!!$preview[0]) {
			return $preview;
		}
	
		throw "Unable to initailize player: can't find preview image.";
	};

	GifPlayer.prototype.__GifPlayerInit = function($el, options) {
		this._$element = $el;

		this._options = options;
	
		var playerPosition = this._$element.css('position');

		this._movie = new GifMovie(this.__getMoviePreview(), this.__getMovieUrl());
	
		this._$element
			.css({
				'display': this._options.block ? 'block' : 'inline-block',
				'position': (playerPosition !== 'relative' && playerPosition !== 'absolute' ? 'relative' : playerPosition),
				'width': this._movie.width,
				'height': this._movie.height
			})
			.append(this._options.controlsTemplate);
	
		this.__createEventListeners();
	};
	
	GifPlayer.prototype.__requestFullScreen = function() {
		var request = this._$element[0].requestFullScreen || 
						this._$element[0].mozRequestFullScreen || 
						this._$element[0].webkitRequestFullScreen ||
						$.noop;
		request.call(this._$element[0]);
	};
	
	GifPlayer.prototype.__cancelFullScreen = function() {
		var cancel = document.cancelFullScreen || 
						document.mozCancelFullScreen || 
						document.webkitCancelFullScreen ||
						$.noop;
		cancel.call(document);
	};

	GifPlayer.prototype.__createEventListeners = function() {
		var self = this;
	
		this._$element.bind('loadGif', $.proxy(this._movie.load, this._movie));
		this._$element.bind('playGif', $.proxy(this._movie.play, this._movie));
		this._$element.bind('stopGif', $.proxy(this._movie.stop, this._movie));
		this._$element.bind('fscreenGif', function() {
			self._movie.state('fullscreen', !self._movie.state('fullscreen'));
		});
	
		this._movie.onStateChange = function(key, value) {
			if (self._options[key + 'Class']) {
				self._$element[value ? 'addClass' : 'removeClass'](self._options[key + 'Class']);
			}
		
			switch (key) {
				case 'fullscreen':
					self.__updatePageScrolling(value);
					if (value) {
						self.__recalculateRatio();
					}
					if (value) {
						self.__requestFullScreen();
					} else {
						self.__cancelFullScreen();
					}
					self.__updatePreviewPosition();
					self._movie.adjustMoviePosition();
					break;
			}
		
			self._$element.trigger('stateChangeGif', [key, value]);
		};
		
		$(document).bind('mozfullscreenchange', function() {
			if (document.fullScreenElement && document.fullScreenElement === null ||
				typeof document.mozFullScreen !== 'undefined' && !document.mozFullScreen ||
				typeof document.webkitIsFullScreen !== 'undefined' && !document.webkitIsFullScreen) {
					self._movie.state('fullscreen', false);
			}
		});

		this._$element.bind('click', function(e) {
			var $target = $(e.target);

			if ($target.hasClass(self._options.playControlClass)) {
				self._$element.trigger(self._movie.state('playing') ? 'stopGif': 'playGif');
			} 

			if ($target.hasClass(self._options.fullscreenControlClass)) {
				self._$element.trigger('fscreenGif');
			} 

			return false;
		});
	
		$(window).resize(function() {
			if (self._movie.state('fullscreen')) {
				self.__recalculateRatio();
				self.__updatePreviewPosition();
				self._movie.adjustMoviePosition();
			}
		});
	};

	GifPlayer.prototype.__updatePageScrolling = function(fullscreen) {
		$('body').css({
			'overflow': fullscreen ? 'hidden' : ''
		});
	};

	GifPlayer.prototype.__updatePreviewPosition = function() {
		this._movie.$preview.css({
			'top': this._movie.state('fullscreen') && this._movie.state('horizontal') ? 
							(window.innerHeight - this._movie.$preview.height()) / 2  :
							''
		});
	};

	GifPlayer.prototype.__recalculateRatio = function() {
		var wWidth = window.innerWidth || document.documentElement.clientWidth;
		var wHeight = window.innerHeight || document.documentElement.clientHeight;
		var aspectRatio = (wWidth * this._movie.height) / (wHeight * this._movie.width);

		if (aspectRatio < 1) {
			// horizontal
			this._movie.state('horizontal', true);
			this._movie.state('vertical', false);
		} else if (aspectRatio >= 1) {
			// vertical
			this._movie.state('horizontal', false);
			this._movie.state('vertical', true);
		}
	
		return aspectRatio;
	};
	$.fn.gifPlayer = function(user_options) {
		var options = $.extend({
				// main
				url: null,
				fullscreen: false,
				preload: false,
				play: false,
		
				// controls
				controlsTemplate: '<span class="gp-controls">' + 
										'<span class="gp-play"/>' +
										'<span class="gp-fullscreen"/>' +
									'</span>',
				playControlClass: 'gp-play',
				fullscreenControlClass: 'gp-fullscreen',
			
				loadingClass: 'gp-loading',
				playingClass: 'gp-playing',
				fullscreenClass: 'gp-full',
				horizontalClass: 'gp-horizontal',
				verticalClass: 'gp-vertical'
				
			}, user_options);

		return this.each(function() {
			var $player = $(this);
			var player = new GifPlayer($player, options);
		
			if (options.play) {
				$player.trigger('playGif')
			} else if (options.preload) {
				$player.trigger('loadGif');
			}
		
			if (options.fullscreen) {
				$player.trigger('fscreenGif');
			}
		
			return this;
		});
	};
})(jQuery);
