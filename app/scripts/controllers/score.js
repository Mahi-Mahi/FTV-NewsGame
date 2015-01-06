'use strict';

angular.module('newsGameApp')
	.controller('ScoreCtrl', function($rootScope, $scope, $routeParams, $log, $location, $timeout, $interval, $q, dataService, titleService, Xiti, Sound, utils, $localStorage) {

		$log.debug('Score');

		Sound.init();

		titleService.setTitle('Score');

		$scope.debug = ($routeParams.debug);

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		Xiti.click(null, "chasseurs-infos::score::level-" + $scope.$storage.level);

		$rootScope.background = 'intro-level-' + $scope.$storage.level;

		$scope.scoring = dataService.data.settings.scoring['level-' + $scope.$storage.level];

		$scope.themes = dataService.data.all.themes;

		$log.debug($scope.$storage.level);
		$log.debug($scope.$storage.scores);
		$log.debug($scope.$storage.scoreStatus);
		$log.debug($scope.$storage.posts);
		$log.debug($scope.scoring);

		if ($scope.$storage.scoreStatus === 'defeat') {
			Sound.play('endLoose');
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
			$log.debug("playAgain");
			$location.path('/play');
		};

		$scope.shareScore = function(type, extra) {
			var text;
			var url = "http://education.francetv.fr/serious-game/chasseurs-d-info-deviendrez-vous-le-redacteur-en-chef-de-demain-o12345";
			var score = $scope.$storage.scores['level-1'] + $scope.$storage.scores['level-2'] + $scope.$storage.scores['level-3'] + $scope.$storage.scores['level-4'];

			if (extra) {
				text = "Journaliste en formation à Chasseur d'infos, j'ai réalisé un score de " + score + " points. Et vous ?";
			} else {
				text = "Chasseur d'infos / En tant que rédacteur en chef de l'International, j'ai réalisé un score de " + score + " points. Et vous ?";
			}

			if (type === 'twitter') {
				window.open('https://twitter.com/share?url=' + url + '&text=' + encodeURI(text), 'sharetwitter', 'status=1,width=600,height=400,scrollbars=no');
			}
			if (type === 'facebook') {
				window.open('http://www.facebook.com/sharer.php?u=' + url + '&text=' + encodeURI(text), 'sharefacebook', 'status=1,width=600,height=400,scrollbars=no');
			}
			return false;
		};

	});