'use strict';
angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, $localStorage, $log, $location, titleService, Xiti) {

		$log.log('Home');

		$rootScope.background = 'home';

		titleService.setTitle('Accueil');

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		$scope.newGame = function() {
			$scope.$storage.level = 1;
			$scope.$storage.scores = {};
			$location.path("/intro");
		};

		Xiti.click(null, "Serious Game::home");
		$log.log($scope.$storage.level);
		$log.log($scope.$storage.scores);

	});