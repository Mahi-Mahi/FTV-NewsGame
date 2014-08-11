'use strict';

angular.module('newsGameApp')
	.controller('IntroCtrl', function($rootScope, $scope, $routeParams, ipCookie, $log, $location, $timeout, $interval, $q, dataService, titleService, utils) {

		$log.log('Intro');

		titleService.setTitle('Intro');

		$scope.debug = ($routeParams.debug);

		// current difficulty level
		$scope.level = ipCookie('level') ? parseInt(ipCookie('level'), 10) : 1;
		ipCookie('level', $scope.level, {
			expires: 365
		});

		// all themes are loaded from /data/all.json
		$scope.themes = dataService.data.all.themes;

		$rootScope.background = 'intro-level-' + $scope.level;

		var chatDelay = dataService.data.settings.chatDelay;
		var chatInterval = dataService.data.settings.chatInterval;

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

		function addChat(delay, speaker, content, speakerName) {
			addStep(delay, function() {
				// var deferred = $q.defer();
				$scope.character = speaker;
				if (speakerName) {
					$scope.characterName = speakerName;
				}

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
					}, chatDelay * delayModifier);
				}
				if ($scope.skipText === 3) {
					$interval.cancel(interval);
					deferred.resolve();
				}
			}, chatInterval * delayModifier);
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

			addChat(chatDelay, 'me', "Hé ! Salut", 'Moi');
			addChat(chatDelay, interlocutor + '1', "Ah, salut !", "Medhi");
			addChat(chatDelay, 'me', "T’as passé un bon week-end ? Tu as trouvé ce que tu allais mettre sur ta fiche d’orientation ?", "Moi");
			addChat(chatDelay, interlocutor + '1', "Pffft ! Pas du tout. Comment on est censés savoir ce qu’on voudra faire plus tard... Et toi, t’as une idée ?", "Medhi");
			if ($routeParams.debug === 'stop') {
				return;
			}
			addChat(chatDelay, 'me', "Non, pas trop. Tu fais quoi avec ton aïePhone ? Tu admires tes selfies du week-end ?", "Moi");
			addChat(chatDelay, interlocutor + '1', "Ah non, plus sérieux que ça ! Je checkais ma timeline sur Cuicuitter !", "Medhi");
			addChat(chatDelay, 'me', "Tu quoi ta quoi sur kuikuiquoi ? J’ai rien compris !", "Moi");
			addChat(chatDelay, interlocutor + '1', "Attends, je vais te montrer... Tu vas voir, c’est génial !", "Medhi");
			// addChat(chatDelay, 'off', "(On entend la sonnerie du lycée. Les deux personnages ont l’air dépités)");
			addChat(chatDelay, interlocutor + '1', "Arf, faut aller en cours. Bon c’est pas grave : ce soir, t’allumes ton ordi, tu me captes sur Skoupe et je t’expliquerai.", "Medhi");
			addChat(chatDelay, 'me', "Ok, super! A ce soir !", "Moi");
			addChat(chatDelay, interlocutor + '1', "A plus!", "Medhi");
			addStep(chatDelay, function() {
				$location.path('/play');
			});

		};

		// Level 2
		scenarii.level2 = function() {
			$log.log(">scenario2");

			steps = [];

			addStep(2500, function() {
				$location.path('/play');
			});

		};

		// Level 3
		scenarii.level3 = function() {
			$log.log(">scenario3");

			steps = [];

			$scope.currentTheme = ipCookie('theme') ? ipCookie('theme') : null;

			var mandatory = utils.shuffle(Object.keys(dataService.data.all.themes))[0];
			$scope.mandatoryTheme = ipCookie('mandatory') ? ipCookie('mandatory') : mandatory;
			ipCookie('mandatory', $scope.mandatoryTheme, {
				expire: 365
			});

			$log.log($scope.mandatoryTheme);

			var interlocutor = 'Daniel';

			addChat(chatDelay, interlocutor + '1', "Bonjour et bienvenue chez L’Univers ! Pas trop tendu(e) pour ta première journée ?", "Jessica");
			addChat(chatDelay, 'me', "Heu... un peu, si !", "moi");
			addChat(chatDelay, interlocutor + '1', "C’est vrai que nous sommes un site d’information très populaire... Mais ne vous en faites pas, ça va aller. Avec votre blog, vous avez montré que vous saviez sélectionner une information. C’est une bonne base !", "Jessica");
			addChat(chatDelay, 'me', "Merci ! Je compte faire de mon mieux !", "moi");
			addChat(chatDelay, interlocutor + '1', "Ici, vous allez continuer à vous occuper de " + $scope.themes[$scope.currentTheme] + ". Mais attention, ce n’est pas tout ! Je vous charge aussi de trouver des infos sur " + $scope.themes[$scope.mandatoryTheme] + " !", "Jessica");
			addChat(chatDelay, 'me', "" + $scope.themes[$scope.mandatoryTheme] + " ? Ok, c'est noté !", "moi");
			addChat(chatDelay, interlocutor + '1', "Et ce n’est pas tout ! Nos lecteurs DÉTESTENT qu’on leur donne de mauvaises infos.", "Jessica");
			addChat(chatDelay, 'me', "Je comprends...", "moi");
			addChat(chatDelay, interlocutor + '1', "Du coup, vous allez devoir apprendre à VERIFIER vous informations. Vous savez comment faire ?", "Jessica");
			addChat(chatDelay, 'me', "Hum... Non.", "moi");
			addChat(chatDelay, interlocutor + '1', "Alors connectez-vous sur votre ordi, je vais vous montrer.", "Jessica");
			addStep(chatDelay, function() {
				$location.path('/play');
			});

		};

		scenario();
		$timeout(function() {
			$scope.fadeSplash = true;
			$timeout(function() {
				doSteps();
			}, chatDelay * delayModifier);
		}, chatDelay * delayModifier);

	});