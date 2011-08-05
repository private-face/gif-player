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
