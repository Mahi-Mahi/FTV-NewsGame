'use strict';
/* global xt_click */

angular.module('newsGameApp').factory('Xiti', function(config, $log, prod, $timeout) {
	return {
		click: function(e, xtpage) {
			// $log.debug("xt_click(", xtpage);
			// "jaujard::home::home::home"
			if (window.xt_click) {
				window.xt_click(document, 'F', 9, "jaujard::" + xtpage);
			} else {
				$timeout(function() {
					window.xt_click(document, 'F', 9, "jaujard::" + xtpage);
				}, 1000);
			}
		}
	};
});