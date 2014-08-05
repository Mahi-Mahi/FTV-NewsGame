'use strict';

angular.module('newsGameApp')
	.controller('IntroCtrl', function($rootScope, $scope, $routeParams, $log, $timeout) {

		$log.log('Intro');

		$scope.debug = ($routeParams.debug);

		// debug config
		var delayModifier = ($scope.debug ? 0.1 : 1);

		$scope.level = 1;

		$rootScope.background = 'sceneB';

		var steps = [];

		function doSteps() {
			var step = null;
			angular.forEach(steps, function(v) {
				if (step === null) {
					step = $timeout(v[1], v[0] * delayModifier);
				} else {
					step = step.then(function() {
						return $timeout(v[1], v[0] * delayModifier);
					});
				}
			});
		}

		// add Step

		function addStep(delay, callback) {
			steps.push([delay, callback]);
		}

		// Add Chat Step

		function addChat(delay, speaker, content) {
			addStep(500, function() {
				$scope.currentChat.status = ((speaker === 'other') ? 'reading' : 'writing');
			});
			addStep(delay - 500, function() {
				$scope.currentChat.discussion.push({
					speaker: speaker,
					content: content
				});
				$scope.currentChat.status = '';
			});
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

			addChat(1500, 'me', "Hé ! Salut");
			addChat(1500, 'other', "Ah, salut !");
			addChat(1500, 'me', "T’as passé un bon week-end ? Tu as trouvé ce que tu allais mettre sur ta fiche d’orientation ?");
			addChat(1500, 'other', "Pffft ! Pas du tout. Comment on est censés savoir ce qu’on voudra faire plus tard... Et toi, t’as une idée ?");
			addChat(1500, 'me', "Non, pas trop. Tu fais quoi avec ton aïePhone ? Tu admires tes selfies du week-end ?");
			addChat(1500, 'other', "Ah non, plus sérieux que ça ! Je checkais ma timeline sur Cuicuitter !");
			addChat(1500, 'me', "Tu quoi ta quoi sur kuikuiquoi ? J’ai rien compris !");
			addChat(1500, 'other', "Attends, je vais te montrer... Tu vas voir, c’est génial !");
			addChat(1500, 'off', "(On entend la sonnerie du lycée. Les deux personnages ont l’air dépités)");
			addChat(1500, 'other', "Arf, faut aller en cours. Bon c’est pas grave : ce soir, t’allumes ton ordi, tu me captes sur Skoupe et je t’expliquerai.");
			addChat(1500, 'other', "Ok, super! A ce soir !");
			addChat(1500, 'other', "A plus!");

			doSteps();

		};

		$timeout(function() {
			$scope.fadeSplash = true;
			$timeout(function() {
				scenario();
			}, 1500 * delayModifier);
		}, 1500 * delayModifier);

	});