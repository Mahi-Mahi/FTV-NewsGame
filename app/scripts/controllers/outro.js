'use strict';

angular.module('newsGameApp')
	.controller('OutroCtrl', function($rootScope, $scope, $routeParams, $log, $location, $timeout, $interval, $q, dataService, titleService, Xiti, utils, $localStorage) {

		$log.log('Outro');

		titleService.setTitle('Outro');

		$scope.debug = ($routeParams.debug);

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		Xiti.click(null, "Serious Game::outro::level-" + $scope.$storage.level);

		var chatDelay = dataService.data.settings.chatDelay;
		var chatInterval = dataService.data.settings.chatInterval;

		// debug config
		var delayModifier = ($scope.debug ? 0.1 : 1);

		$log.log($scope.$storage.level);
		$log.log($scope.$storage.scores);
		$log.log($scope.$storage.posts);
		$log.log($scope.$storage.scoreStatus);

		$rootScope.background = 'intro-level-' + $scope.$storage.level;

		$scope.showScore = function() {
			$location.path('/score');
		};

		function showText(content) {
			$log.log("showText(", content);
			var deferred = $q.defer();
			var contentIdx = 0;
			$scope.typed = '';
			$scope.skipText = 0;
			var interval = $interval(function() {
				if ($scope.skipText === 0) {
					$scope.typed = $scope.typed + content[contentIdx];
					contentIdx = contentIdx + 1;
					if (contentIdx === content.length) {
						$scope.skipText++;
					}
				}
				if ($scope.skipText === 1) {
					$scope.typed = content;
					$scope.skipText = 2;
					$timeout(function() {
						$scope.skipText = 3;
					}, chatDelay * delayModifier);
				}
				if ($scope.skipText === 3) {
					$interval.cancel(interval);
					deferred.resolve();
				}
			}, chatInterval * delayModifier);
			return deferred.promise;
		}

		var outro = {};

		outro.level1 = function() {
			$location.path('/score');
		};

		outro.level2 = function() {
			var text;
			$scope.character = "Daniel3";
			$scope.characterName = "Mehdi";
			if ($scope.$storage.scoreStatus === 'defeat') {
				if ($scope.$storage.posts.length < 4) {
					text = "Pas mal ton blog,... mais y a pas assez d'info. Faut te secouer un peu ! Maintenant c'est l'heure de réviser tes cours, non ? Mais ne lâche pas l'affaire, tu feras mieux demain ! ";
				} else {
					text = "Tu espères faire une grande carrière de journaliste en publiant autant d'anêries ? Le moins que l'on puisse dire, c'est que tes lecteurs n'apprécient pas ton manque de sérieux ! Allez, oublie cette mauvaise journée et essaye de faire mieux demain !";
				}
			} else {
				text = "Bravo ! Tu as montré ton talent pour sélectionner des informations ! C'est la base du métier de journaliste. Mais certaines informations sont plus crédibles que d'autres... Sauras-tu les détecter ?";

			}
			showText(text).then(function() {
				$timeout(function() {
					$location.path('/score');
				}, 2500);
			});
		};

		outro.level3 = function() {
			var text;
			$scope.character = "SoniaB5";
			$scope.characterName = "Sonia";
			if ($scope.$storage.scoreStatus === 'defeat') {
				if ($scope.$storage.posts.length < 4) {
					$scope.characterName = "CleaningGuy";
					text = "Vous n'êtes pas mauvais... Mais pas assez rapide !\n Vous n'avez pas publié assez de bonnes infos aujourd'hui, et maintenant c'est l'heure de rentrer chez vous. Allez, rentrez chez vous... et réessayez demain !";
				} else {
					$scope.character = "SoniaB5";
					text = "Vous espérez faire une grande carrière de journaliste en publiant autant d'anêries ? Le moins que l'on puisse dire, c'est que je ne suis pas de cet avis ! Allez, oubliez cette mauvaise journée et essayez de faire mieux demain !";
				}
			} else {
				text = "Bravo ! Vous êtes vigilant : avec vous, pas question de publier n'importe quoi ! Et vos lecteurs aiment ça ! Vous commencez à être un journaliste confirmé. Mais si vous étiez aux commandes, sauriez vous détecter les scoops et choisir quelles infos mettre en avant sur votre site ?";

			}
			showText(text).then(function() {
				$timeout(function() {
					$location.path('/score');
				}, 2500);
			});
		};
		outro.level4 = function() {
			var text;
			var totalScore = $scope.$storage.scores['level-1'] + $scope.$storage.scores['level-2'] + $scope.$storage.scores['level-3'] + $scope.$storage.scores['level-4'];
			$scope.characterName = "Sonia";
			if ($scope.$storage.scoreStatus === 'defeat') {
				$scope.character = "SoniaB5";
				text = "Oups.... On dirait que les subtilités du travail de rédacteur en chef vous échappent encore... Normal : ce n'est pas facile de sélectionner, de vérifier et de hiérarchiser l'information ! Si vous ne voulez pas que je revienne précipitemment de vacances pour mettre les points sur les i, vous devriez tenter à nouveau l'aventure...";
			} else {
				if (totalScore > dataService.data.settings.scoring['excellent-score']) {
					$scope.characterName = null;
					$scope.albert = true;
				} else {
					text = "Félicitations ! Vous maîtrisez tous les rouages du métier de journaliste : vous êtes capable de sélectionner, de vérifier et de hiérarchiser l'information. Mais... Vous avez comme la vague impression que vous auriez pu faire ENCORE mieux... ";
				}
			}
			if (text) {
				showText(text).then(function() {
					$timeout(function() {
						$location.path('/score');
					}, 2500);
				});
			}
		};

		if ($routeParams.debug === 'albert') {
			$scope.characterName = null;
			$scope.albert = true;
		} else {
			if (outro['level' + $scope.$storage.level]) {
				outro['level' + $scope.$storage.level]();
			}
		}

	});