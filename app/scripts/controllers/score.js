'use strict';

angular.module('newsGameApp')
	.controller('ScoreCtrl', function($rootScope, $scope, $routeParams, $log, $location, $timeout, $interval, $q, dataService, titleService, utils, $localStorage) {

		$log.log('Score');

		titleService.setTitle('Score');

		$scope.debug = ($routeParams.debug);

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		$rootScope.background = 'intro-level-' + $scope.$storage.level;

		$scope.scoring = dataService.data.settings.scoring['level-' + $scope.$storage.level];

		$scope.themes = dataService.data.all.themes;

		$log.log($scope.$storage.level);
		$log.log($scope.$storage.scores);
		$log.log($scope.$storage.scoreStatus);
		$log.log($scope.$storage.posts);
		$log.log($scope.scoring);

		$scope.nextLevel = function() {
			$scope.$storage.level = parseInt($scope.$storage.level, 10) + 1;
			$location.path('/intro');
		};

		$scope.playAgain = function() {
			$log.log("playAgain");
			$location.path('/play');
		};

	});