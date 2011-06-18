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
