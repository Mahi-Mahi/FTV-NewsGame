'use strict';
/* global buzz */

angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, $localStorage, $log, $location, $timeout, prod, baseurl, titleService, Xiti, Sound) {

		$log.debug('Home');

		Sound.init();

		Sound.sounds.home = new buzz.sound("sounds/home");
		if (prod || !Sound.muteDev) {
			Sound.play('home');
		}

		$rootScope.background = 'home';

		titleService.setTitle('Accueil');

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		$scope.newGame = function() {
			$log.debug("newGame");
			Sound.play('click');
			$localStorage.$reset();
			$log.debug($scope.$storage);
			$log.debug($scope.$storage.chosenTheme);
			$scope.$storage.level = 1;
			$location.path("/intro");
		};

		Xiti.click(null, "Serious Game::home");

		$log.debug($scope.$storage.level);
		$log.debug($scope.$storage.scores);

		$timeout(function() {
			jQuery("#credits, .bt-close-splash").on('click', function(event) {
				jQuery('#credits-body').toggleClass('ng-hide');
				event.preventDefault();
			});
		}, 1000);
	});