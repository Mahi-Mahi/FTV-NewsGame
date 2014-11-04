'use strict';
/* global buzz */
/* global jQuery */

angular.module('newsGameApp').factory('Sound', function(config, $log, prod) {
	return {
		muteDev: true,
		sounds: {},
		playing: null,
		muted: false,
		extension: 'mp3',
		init: function() {
			//
			$log.debug("Sound.init(), prod : ", prod);

			buzz.defaults.formats = ['ogg', 'mp3', 'aac'];

			if (!prod && this.muteDev) {
				return;
			}
			$log.debug("buzz.isSupported", buzz.isSupported());

			if (buzz.isOGGSupported()) {
				this.extension = 'ogg';
			}
			if (buzz.isAACSupported()) {
				this.extension = 'aac';
			}

			$log.debug("Sound.extension", this.extension);

			var sounds = this.sounds;
			angular.forEach(config.sounds, function(value, key) {
				$log.debug(value);
				if (!sounds[key]) {
					sounds[key] = new buzz.sound(value);
				}
			});
			this.sounds = sounds;
		},
		play: function(sound, bgd) {

			$log.debug("Sound.play(", sound, bgd);
			if (!prod && this.muteDev) {
				return;
			}
			if (bgd) {
				if (this.playing !== sound) {
					if (this.playing) {
						var sounds = this.sounds;
						this.sounds[this.playing].fadeOut(1000, function() {
							sounds[sound].loop().play().fadeIn(1000);
						});
					} else {
						this.sounds[sound].loop().play().fadeIn(1000);
					}
				}
			} else {
				this.sounds[sound].play();
			}
			this.playing = sound;
		},
		toggleMute: function() {
			$log.debug("toggleMute");
			if (this.playing) {
				$log.debug("playing");
				if (this.muted) {
					$log.debug("muted");
					this.sounds[this.playing].fadeIn(1000);
					this.muted = false;
					jQuery('#footer-tools__item--unmute').hide();
					jQuery('#footer-tools__item--mute').show();
				} else {
					$log.debug("not mtued");
					$log.debug(this.sounds[this.playing]);
					this.sounds[this.playing].stop();
					// this.sounds[this.playing].fadeOut(1000);
					this.muted = true;
					jQuery('#footer-tools__item--mute').hide();
					jQuery('#footer-tools__item--unmute').show();
				}
			}
		}
	};
});