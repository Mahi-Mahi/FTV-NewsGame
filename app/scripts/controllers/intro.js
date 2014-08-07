'use strict';

angular.module('newsGameApp')
	.controller('IntroCtrl', function($rootScope, $scope, $routeParams, $cookies, $log, $location, $timeout, $interval, $q, titleService) {

		$log.log('Intro');

		titleService.setTitle('Intro');

		$scope.debug = ($routeParams.debug);

		// current difficulty level
		$scope.level = parseInt($cookies.level, 10) ? parseInt($cookies.level, 10) : 1;
		$cookies.level = $scope.level;

		$rootScope.background = 'intro-level-' + $scope.level;

		// debug config
		var delayModifier = ($scope.debug ? 0.1 : 1);

		var steps = [];

		function doSteps() {
			var step = null;
			angular.forEach(steps, function(v) {
				if (step === null) {
					step = v[1]();
				} else {
					step = step.then(function() {
						return v[1]();
					});
				}
			});
		}

		// Add Step

		function addStep(delay, callback) {
			steps.push([delay, callback]);
		}

		// Add Chat Step

		function addChat(delay, speaker, content) {
			addStep(delay, function() {
				// var deferred = $q.defer();
				$scope.character = speaker;

				return showText(content);

				// return deferred.promise;
			});
		}

		$scope.skipText = 0;
		$scope.skipCurrentText = function() {
			$scope.skipText++;
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
					}, 1500 * delayModifier);
				}
				if ($scope.skipText === 3) {
					$interval.cancel(interval);
					deferred.resolve();
				}
			}, 40 * delayModifier);
			return deferred.promise;
		}

		/*
		Scenarii
		*/

		function scenario() {
			if (scenarii['level' + $scope.level]) {
				scenarii['level' + $scope.level]();
			}
		}

		var scenarii = {};

		// Level 1
		scenarii.level1 = function() {
			$log.log(">scenario1");

			steps = [];

			var interlocutor = 'Daniel';

			addChat(1500, 'me', "Hé ! Salut");
			addChat(1500, interlocutor + '1', "Ah, salut !");
			addChat(1500, 'me', "T’as passé un bon week-end ? Tu as trouvé ce que tu allais mettre sur ta fiche d’orientation ?");
			addChat(1500, interlocutor + '1', "Pffft ! Pas du tout. Comment on est censés savoir ce qu’on voudra faire plus tard... Et toi, t’as une idée ?");
			addChat(1500, 'me', "Non, pas trop. Tu fais quoi avec ton aïePhone ? Tu admires tes selfies du week-end ?");
			addChat(1500, interlocutor + '1', "Ah non, plus sérieux que ça ! Je checkais ma timeline sur Cuicuitter !");
			addChat(1500, 'me', "Tu quoi ta quoi sur kuikuiquoi ? J’ai rien compris !");
			addChat(1500, interlocutor + '1', "Attends, je vais te montrer... Tu vas voir, c’est génial !");
			addChat(1500, 'off', "(On entend la sonnerie du lycée. Les deux personnages ont l’air dépités)");
			addChat(1500, interlocutor + '1', "Arf, faut aller en cours. Bon c’est pas grave : ce soir, t’allumes ton ordi, tu me captes sur Skoupe et je t’expliquerai.");
			addChat(1500, 'me', "Ok, super! A ce soir !");
			addChat(1500, interlocutor + '1', "A plus!");
			addStep(1500, function() {
				$location.path('/play');
			});

		};

		// Level 2
		scenarii.level2 = function() {
			$log.log(">scenario2");

			steps = [];

			addStep(1500, function() {
				$location.path('/play');
			});

		};

		scenario();
		$timeout(function() {
			$scope.fadeSplash = true;
			$timeout(function() {
				doSteps();
			}, 1500 * delayModifier);
		}, 1500 * delayModifier);

	});