'use strict';

angular.module('newsGameApp')
	.controller('MainCtrl', function($scope, $log, $timeout) {

		$scope.templates = [
			'lorem'
		];

		$scope.windows = {
			win1: {
				title: 'windows 1',
				visible: false,
				template: 'lorem'
			},
			win2: {
				title: 'windows 2',
				visible: false,
				template: 'lorem'
			}
		};

		$scope.openWin = function(id) {
			$log.log(id);
			jQuery('#' + id).data('kendoWindow').open();
		};

		$timeout(function() {

			$log.log('ready');

		}, 50);

	});