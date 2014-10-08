'use strict';
/* global buzz */
/* global jQuery */

angular.module('newsGameApp').factory('Sound', function(config, $log, prod) {
	return {
		muteDev: false,
		sounds: {},
		playing: null,
		muted: false,
		extension: 'mp3',
		init: function() {
			//
			$log.log("Sound.init(), prod : ", prod);

			buzz.defaults.formats = ['ogg', 'mp3', 'aac'];

			if (!prod && this.muteDev) {
				return;
			}
			$log.log("buzz.isSupported", buzz.isSupported());

			if (buzz.isOGGSupported()) {
				this.extension = 'ogg';
			}
			if (buzz.isAACSupported()) {
				this.extension = 'aac';
			}

			$log.log("Sound.extension", this.extension);

			var sounds = this.sounds;
			angular.forEach(config.sounds, function(value, key) {
				$log.log(value);
				if (!sounds[key]) {
					sounds[key] = new buzz.sound(value);
				}
			});
			this.sounds = sounds;
		},
		play: function(sound, bgd) {

			// $log.log("Sound.play(", sound, bgd);
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
			$log.log("toggleMute");
			if (this.playing) {
				$log.log("playing");
				if (this.muted) {
					$log.log("muted");
					this.sounds[this.playing].fadeIn(1000);
					this.muted = false;
					jQuery('#footer-tools__item--unmute').hide();
					jQuery('#footer-tools__item--mute').show();
				} else {
					$log.log("not mtued");
					$log.log(this.sounds[this.playing]);
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