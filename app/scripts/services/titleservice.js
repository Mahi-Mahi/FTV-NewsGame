'use strict';

angular.module('newsGameApp')
	.factory('titleService', function($document) {
		var suffix, title;
		suffix = title = "";
		return {
			setSuffix: function(s) {
				suffix = s;
				return suffix;
			},
			getSuffix: function() {
				return suffix;
			},
			setTitle: function(t) {
				if (suffix !== "") {
					title = t + suffix;
				} else {
					title = t;
				}
				title = title + " | Chasseur d'infos";
				return $document.prop('title', title);
			},
			getTitle: function() {
				return $document.prop('title');
			}
		};
	});