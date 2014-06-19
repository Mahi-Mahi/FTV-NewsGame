'use strict';

angular.module('newsGameApp')
	.controller('MainCtrl', function($scope, $log, $timeout, $interval, dataService) {

		$scope.windows = {};

		$scope.currentTheme = null;

		// Cuitcuitter

		$scope.cuits = [];
		$scope.allCuits = [];

		$scope.currentCuit = null;

		$scope.openSource = function(id) {
			$log.log("openSource(" + id);
			$scope.closeWin('source');
			$scope.currentSource = dataService.data.all.sources[id];
			$scope.openWin('source');
		};

		function addCuit() {
			var added = false;
			angular.forEach(dataService.data.all.cuits, function(cuit, key) {
				if ($scope.allCuits.indexOf(key) === -1 && !added) {
					cuit.author = dataService.data.all.sources[cuit.source];
					$scope.allCuits.push(key);
					$scope.cuits.push(cuit);
					added = true;
				}
			});
		}

		function loadCuits() {
			$interval(function() {
				addCuit();
			}, 2500);

		}

		// Skoupe

		$scope.contacts = dataService.data.all.contacts;

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
		createWindow('source', {
			title: 'Source',
			active: false,
			template: 'cuicuiter-source',
			width: 400,
			height: 200,
			position: {
				top: 125,
				left: 250
			}
		});

		createWindow('skoupe', {
			title: 'Skoupe',
			visible: true,
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

		// Start

		$timeout(function() {

			addCuit();
			loadCuits();

		}, 50);
	});