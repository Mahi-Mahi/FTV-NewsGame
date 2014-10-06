'use strict';

angular.module('newsGameApp')
	.controller('ScoreCtrl', function($rootScope, $scope, $routeParams, $log, $location, $timeout, $interval, $q, dataService, titleService, Xiti, Sound, utils, $localStorage) {

		$log.log('Score');

		Sound.init();

		titleService.setTitle('Score');

		$scope.debug = ($routeParams.debug);

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		Xiti.click(null, "Serious Game::score::level-" + $scope.$storage.level);

		$rootScope.background = 'intro-level-' + $scope.$storage.level;

		$scope.scoring = dataService.data.settings.scoring['level-' + $scope.$storage.level];

		$scope.themes = dataService.data.all.themes;

		$log.log($scope.$storage.level);
		$log.log($scope.$storage.scores);
		$log.log($scope.$storage.scoreStatus);
		$log.log($scope.$storage.posts);
		$log.log($scope.scoring);

		if ($scope.$storage.scoreStatus === 'defeat') {
			Sound.sounds.endLoose.play();
		}

		if ($scope.$storage.scoreStatus === 'victory') {
			if ($scope.$storage.level < 4) {
				Sound.play('endWin');
			} else {
				Sound.play('endGame');
			}
		}

		$scope.nextLevel = function() {
			Sound.play('click');
			$scope.$storage.level = parseInt($scope.$storage.level, 10) + 1;
			$location.path('/intro');
		};

		$scope.playAgain = function() {
			Sound.play('click');
			$log.log("playAgain");
			$location.path('/play');
		};

	});