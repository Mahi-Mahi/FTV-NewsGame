'use strict';

angular.module('newsGameApp')
	.controller('MainCtrl', function($scope, $log, $timeout) {

		$scope.windows = {};

		$scope.currentTheme = null;

		// Cuitcuitter

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

		$scope.currentCuit = null;

		$scope.openCuit = function(id) {
			$log.log("openCuit(" + id);
			$scope.closeWin('cuit');
			$scope.currentCuit = $scope.cuits[id];
			$scope.openWin('cuit');
		};

		// Skoupe

		$scope.contacts = {
			'jean-luc': {
				name: 'Jean Luc',
				content: 'Cras quis eleifend arcu, in. Ut aliquam sapien sed felis.'
			},
			'jean-michel': {
				name: 'Jean-Michel',
				content: 'Aenean mattis, lacus at eleifend. Etiam rhoncus iaculis ante eu.'
			}
		};

		$scope.currentContact = null;

		$scope.openContact = function(id) {
			$log.log("openContact(" + id);
			$scope.closeWin('contact');
			$scope.currentContact = $scope.contacts[id];
			$scope.openWin('contact');
		};

		// Generic Window Management

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

		$scope.toggleWin = function(id) {
			if ($scope.windows[id].visible) {
				$scope.closeWin(id);
			} else {
				$scope.openWin(id);
			}
		};

		$scope.openWin = function(id) {
			if (!$scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').open();
			}
		};
		$scope.closeWin = function(id) {
			if ($scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').close();
			}
		};

		// Initialisation

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
		createWindow('contact', {
			title: 'contact',
			active: false,
			template: 'skoupe-contact',
			position: {
				top: 125,
				left: 550
			}
		});

		createWindow('notepad', {
			title: 'Bloc-Notes',
			template: 'notepad',
			visible: true,
			position: {
				top: 250,
				left: 450
			}
		});
		$timeout(function() {

		}, 50);

	});