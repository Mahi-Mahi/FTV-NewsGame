"use strict";
angular.module('newsGameApp')
	.filter('duration', function() {
		return function(input) {
			var hours = Math.floor(input / 60);
			var minutes = input % 60;
			var result = '';
			if (hours) {
				result = hours + ' heure' + (hours > 1 ? 's' : '');
			}
			if (minutes) {
				result += ' ' + minutes + ' minutes';
			}
			return result;
		};
	})
	.filter('time', function() {
		return function(input) {
			var hours = Math.floor(input / 60);
			var minutes = input % 60;
			var result = '';
			if (hours) {
				result = hours + ' h';
			}
			if (minutes) {
				result += ' ' + minutes + ' m';
			}
			return result;
		};
	})
	.filter('removeAT', function() {
		return function(input) {
			if (typeof input === 'undefined') {
				return '';
			}
			return input.replace('@', '');
		};
	});