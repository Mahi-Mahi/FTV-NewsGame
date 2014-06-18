'use strict';

angular.module('newsGameApp')
	.controller('MainCtrl', function($scope, $log, $timeout) {

		$scope.templates = [
			'lorem'
		];

		$scope.windows = {};
		$scope.currentCuit = null;

		$scope.truc = 'machin';

		function createWindow(id, args) {
			$scope.windows[id] = angular.extend({
				visible: false,
				active: true,
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
			$log.log('loadCuits');
			$scope.cuits = {
				'cuit-1': {
					author: '@toto',
					content: 'Cras quis eleifend arcu, in. Ut aliquam sapien sed felis.'
				},
				'cuit-2': {
					author: '@foo',
					content: 'Aenean mattis, lacus at eleifend. Etiam rhoncus iaculis ante eu.'
				}
			};
		}

		$scope.openCuit = function(id) {
			$log.log("openCuit(" + id);
			$scope.currentCuit = $scope.cuits[id];
			$scope.openWin('cuit');
		};

		$scope.toggleWin = function(id) {
			if ($scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').close();
			} else {
				jQuery('#' + id).data('kendoWindow').open();
			}
		};

		$scope.openWin = function(id) {
			if (!$scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').open();
			}
		};

		function activateWin(id) {

		}

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
		createWindow('cuit', {
			title: 'Cuit',
			active: false,
			template: 'cuicuiter-cuit',
			position: {
				top: 125,
				left: 250
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

		$timeout(function() {

		}, 50);

	});