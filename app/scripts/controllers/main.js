'use strict';

angular.module('newsGameApp')
	.controller('MainCtrl', function($scope, $log, $timeout) {

		$scope.templates = [
			'lorem'
		];

		$scope.windows = {};

		function createWindow(id, args) {
			$scope.windows[id] = angular.extend({
				visible: false,
				resizable: false,
				width: 400,
				height: 400,
				position: {
					top: 300,
					left: 300
				}
			}, args);
		}

		function loadCuits() {
			$scope.cuits = [{
				id: 'cuit-1',
				author: '@toto',
				content: 'Cras quis eleifend arcu, in. Ut aliquam sapien sed felis.'
			}, {
				id: 'cuit-2',
				author: '@foo',
				content: 'Aenean mattis, lacus at eleifend. Etiam rhoncus iaculis ante eu.'
			}];
		}

		$scope.toggleWin = function(id) {
			if ($scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').close();
			} else {
				jQuery('#' + id).data('kendoWindow').open();
			}
		};

		$timeout(function() {

			$log.log('ready');

			loadCuits();

			createWindow('cuicuiter', {
				title: 'Cuicuiter',
				visible: true,
				template: 'cuicuiter-main',
				position: {
					top: 100,
					left: 50
				}
			});

			createWindow('skoupe', {
				title: 'Skoupe',
				visible: false,
				template: 'skoupe-main',
				position: {
					top: 150,
					left: 600
				}
			});

		}, 50);

	});