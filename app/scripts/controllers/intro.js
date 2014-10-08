'use strict';

angular.module('newsGameApp')
	.controller('IntroCtrl', function($rootScope, $scope, $routeParams, $log, $location, $timeout, $interval, $q, dataService, titleService, Xiti, Sound, utils, $localStorage) {

		$log.log('Intro');

		titleService.setTitle('Intro');

		Sound.init();

		$log.log(Sound.sounds);

		Sound.play('introText');

		$scope.debug = ($routeParams.debug);

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		Xiti.click(null, "Serious Game::intro::level-" + $scope.$storage.level);

		// all themes are loaded from /data/all.json
		$scope.themes = dataService.data.all.themes;

		$rootScope.background = 'intro-level-' + $scope.$storage.level;

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
			$scope.skipText = 1;
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
			if (scenarii['level' + $scope.$storage.level]) {
				scenarii['level' + $scope.$storage.level]();
			}
		}

		var scenarii = {};

		// Level 1
		scenarii.level1 = function() {
			$log.log(">scenario1");

			steps = [];

			var interlocutor = 'Daniel';

			addChat(chatDelay, 'me', "Hé ! Salut", 'Moi');
			addChat(chatDelay, interlocutor + "3", "Ah, salut !", "Mehdi");
			addChat(chatDelay, 'me', "T’as passé un bon week-end ? Tu as trouvé ce que tu allais mettre sur ta fiche d’orientation ?", "Moi");
			addChat(chatDelay, interlocutor + "3", "Pffft ! Pas du tout. Comment on est censés savoir ce qu’on voudra faire plus tard... Et toi, t’as une idée ?", "Mehdi");
			if ($routeParams.debug === 'stop') {
				return;
			}
			addChat(chatDelay, 'me', "Non, pas trop. Tu fais quoi avec ton aïePhone ? Tu admires tes selfies du week-end ?", "Moi");
			addChat(chatDelay, interlocutor + "3", "Ah non, plus sérieux que ça ! Je checkais ma timeline sur Cuicuitter !", "Mehdi");
			addChat(chatDelay, 'me', "Tu quoi ta quoi sur kuikuiquoi ? J’ai rien compris !", "Moi");
			addChat(chatDelay, interlocutor + "3", "Attends, je vais te montrer... Tu vas voir, c’est génial !", "Mehdi");
			// addChat(chatDelay, 'off', "(On entend la sonnerie du lycée. Les deux personnages ont l’air dépités)");
			addStep(chatDelay,
				function() {
					Sound.play('schoolBell');
				}
			);
			addChat(chatDelay, interlocutor + "3", "Arf, faut aller en cours. Bon c’est pas grave : ce soir, t’allumes ton ordi, tu me captes sur Skoupe et je t’expliquerai.", "Mehdi");
			addChat(chatDelay, 'me', "Ok, super! A ce soir !", "Moi");
			addChat(chatDelay, interlocutor + "3", "A plus!", "Mehdi");
			addStep(chatDelay, function() {
				$log.log(Sound.playing);
				if (Sound.playing) {
					Sound.sounds[Sound.playing].fadeOut(500);
				}
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

			var mandatory;
			while (!mandatory || mandatory === $scope.$storage.selectedTheme) {
				mandatory = utils.shuffle(Object.keys(dataService.data.all.themes))[0];
			}
			$scope.$storage.mandatoryTheme = mandatory;

			var interlocutor = 'SoniaA';

			addChat(chatDelay, interlocutor + "3", "Bonjour et bienvenue chez L’International ! Pas trop tendu(e) pour ta première journée ?", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Heu... un peu, si !", "moi");
			addChat(chatDelay, interlocutor + "3", "C’est vrai que nous sommes un site d’informations très populaire... Mais ne vous en faites pas, ça va aller. Avec votre blog, vous avez montré que vous saviez sélectionner une information. C’est une bonne base !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Merci ! Je compte faire de mon mieux !", "moi");
			addChat(chatDelay, interlocutor + "3", "Ici, vous allez continuer à vous occuper de " + $scope.themes[$scope.$storage.chosenTheme] + ". Mais attention, ce n’est pas tout ! Je vous charge aussi de trouver des infos sur " + $scope.themes[$scope.$storage.mandatoryTheme] + " !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "" + $scope.themes[$scope.$storage.mandatoryTheme] + " ? Ok, c'est noté !", "moi");
			addChat(chatDelay, interlocutor + "3", "Et ce n’est pas tout ! Nos lecteurs DÉTESTENT qu’on leur donne de mauvaises infos.", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Je comprends...", "moi");
			addChat(chatDelay, interlocutor + "3", "Du coup, vous allez devoir apprendre à VERIFIER vos informations. Vous savez comment faire ?", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Hum... Non.", "moi");
			addChat(chatDelay, interlocutor + "3", "Alors connectez-vous sur votre ordi, je vais vous montrer.", "Sonia, rédactrice en chef");
			addStep(chatDelay, function() {
				$location.path('/play');
			});

		};

		// Level 4
		scenarii.level4 = function() {
			$log.log(">scenario4");

			steps = [];

			var interlocutor = 'SoniaB';

			addChat(chatDelay, interlocutor + "3", "Ah vous voilà ! Je vous attendais !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Oups... Qu’est-ce qui se passe, chef, j’ai fait une bêtise ?", "moi");
			addChat(chatDelay, interlocutor + "3", "Au contraire ! Vous vous débrouillez très bien ! Alors comme je pars en vacances ce matin, j’ai pensé que vous alliez me remplacer !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Ah bon ?!! Mais je... Heu...", "moi");
			addChat(chatDelay, interlocutor + "3", "Mais si, mais si, vous allez vous en sortir ! Il y a seulement deux règles à connaître !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Ah ? Les quelles ?", "moi");
			addChat(chatDelay, interlocutor + "3", "La première : les gens aiment qu’on leur parle de tout ! Vous devez donc essayer de publier des infos qui portent sur chacune des six thématiques existantes !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Ah. Ca, c’est plutôt bien : je ne suis plus obligé de chercher seulement les infos parlant de " + $scope.themes[$scope.$storage.chosenTheme] + " et " + $scope.themes[$scope.$storage.mandatoryTheme] + "...", "moi");
			addChat(chatDelay, interlocutor + "3", "Eh non. Mais attention à la règle numéro 2 : il faut HIERARCHISER l’information !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Hiérarchi... quoi ?", "moi");
			addChat(chatDelay, interlocutor + "3", "Pffff... Bon, connectez-vous sur mon ordinateur, je vais vous montrer en utilisant ma tablette. Allez, je vous laisse, je me connecte dès que je suis dans le taxi. A bientôôôôôôt !", "Sonia, rédactrice en chef");
			addChat(chatDelay, 'me', "Mais... attendez, je... Ah, elle est partie.", "moi");
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
		}, 4000 + chatDelay * delayModifier);

	});