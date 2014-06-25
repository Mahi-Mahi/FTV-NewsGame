"use strict";
angular.module('newsGameApp').filter('duration', function() {
	return function(input) {
		var hours = Math.floor(input / 60);
		var minutes = input % 60;
		var result = '';
		if (hours) {
			result = hours + ' heures';
		}
		if (minutes) {
			result += ' ' + minutes + ' minutes';
		}
		return result;
	};
});