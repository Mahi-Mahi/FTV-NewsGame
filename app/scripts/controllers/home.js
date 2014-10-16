'use strict';
/* global buzz */

angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, $localStorage, $log, $location, prod, titleService, Xiti, Sound) {

		$log.log('Home');

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
		$log.log("newGame");
			Sound.play('click');
			$localStorage.$reset();
			$log.log($scope.$storage);
			$log.log($scope.$storage.chosenTheme);
			$scope.$storage.level = 1;
			$location.path("/intro");
		};

		Xiti.click(null, "Serious Game::home");

		$log.log($scope.$storage.level);
		$log.log($scope.$storage.scores);

	});