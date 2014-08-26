'use strict';
angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, $localStorage, $log, $location, titleService) {

		$log.log('Home');

		$rootScope.background = 'home';

		titleService.setTitle('Accueil');

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		$scope.newGame = function() {
			$scope.level = 1;
			$scope.scores = {};
			$location.path("/intro");
		};

	});