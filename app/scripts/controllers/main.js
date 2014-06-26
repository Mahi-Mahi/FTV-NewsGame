'use strict';

angular.module('newsGameApp')
	.controller('MainCtrl', function($scope, $routeParams, $log, prod, $timeout, $interval, dataService) {

		$scope.debug = ($routeParams.debug);

		// debug config
		var delayModifier = ($scope.debug ? 0.1 : 1);

		// reference to all windows on the desktop
		$scope.windows = {};

		// current difficulty level
		$scope.level = 1;

		// TotalTime ( and RemainingTime ) are loaded from /data/settings.json
		$scope.totalTime = $scope.remainingTime = dataService.data.settings.totalTime;

		// all themes are loaded from /data/all.json
		$scope.themes = dataService.data.all.themes;

		// selected theme
		$scope.currentTheme = null;

		/*
		CuitCuiter
		*/

		// currently displayed cuits
		$scope.allCuits = [];
		$scope.cuits = [];

		// open Cuit source window
		$scope.openSource = function(id) {
			$log.log("openSource(" + id);
			$scope.closeWin('source');
			$scope.currentSource = dataService.data.all.sources[id];
			$scope.openWin('source');
		};

		// add cuit to Cuicuiter timeline

		function addCuit(next) {
			var added = false;
			// iterate through all cuits ( loaded from /data/all.json )
			angular.forEach(dataService.data.all.cuits, function(cuit, key) {
				// if cuit is not currenlty displayed
				if ($scope.allCuits.indexOf(key) === -1 && !added) {
					cuit.author = dataService.data.all.sources[cuit.source];
					$scope.allCuits.push(key);
					$scope.cuits.unshift(cuit);
					$timeout(function() {
						cuit.visible = true;
					}, 1);
					added = true;
					// scheduled next cuit
					if (next) {
						$timeout(function() {
							addCuit(true);
						}, Math.random() * 1500 + 800);
					}
				}
			});
		}

		// Verify Cuit Theme ( + decrement time counter )
		$scope.verifyCuitTheme = function(cuit) {
			$log.log("verifyCuitTheme(" + cuit);
			cuit.themeVerified = true;
			decrementTime('verify-cuit-theme');
		};

		/*
		Skoupe
		*/

		// all contacts are loaded from /data/all.json
		$scope.contacts = dataService.data.all.contacts;

		// current contact displayed in contact detail window
		$scope.currentContact = null;

		// open contact detail window
		$scope.openContact = function(id) {
			$log.log("openContact(" + id);
			$scope.closeWin('contact');
			$scope.currentContact = $scope.contacts[id];
			$scope.openWin('contact');
		};

		// current chat displayed in chat window
		$scope.currentChat = null;

		// open chat window
		$scope.openChat = function(id) {
			$log.log("openChat(" + id);
			$scope.closeWin('chat');
			$scope.currentchatContact = $scope.chat[id];
			$scope.openWin('chat');
		};

		/*
		Timeline
		*/

		// decrement remaining time

		function decrementTime(type) {
			// the cost of each actions are specified in /data/settings.json
			var value = dataService.data.settings.actionsCost[type];
			$log.log("decrementTime : " + value + " (" + type + ")");
			$scope.remainingTime -= value;
		}

		/*
		Generic Window Management
		*/

		// create a new window (KendoUI will automattically instatiate ir)

		function createWindow(id, args) {
			$scope.windows[id] = angular.extend({
				visible: false,
				active: true,
				resizable: false,
				width: 400,
				height: 400,
				position: {
					top: 300,
					left: 300
				}
			}, args);
		}

		// show/hide window
		$scope.toggleWin = function(id) {
			if ($scope.windows[id].visible) {
				$scope.closeWin(id);
			} else {
				$scope.openWin(id);
			}
		};
		$scope.openWin = function(id) {
			if (!$scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').open();
			}
		};
		$scope.closeWin = function(id) {
			if ($scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').close();
			}
		};

		/*
		Initialisation
		*/

		createWindow('cuicuiter', {
			title: 'Cuicuiter',
			visible: true,
			template: 'cuicuiter-main',
			height: 400,
			position: {
				top: 10,
				left: 20
			}
		});
		createWindow('source', {
			title: 'Source',
			active: false,
			template: 'cuicuiter-source',
			width: 400,
			height: 200,
			position: {
				top: 125,
				left: 250
			}
		});

		createWindow('skoupe', {
			title: 'Skoupe',
			visible: true,
			template: 'skoupe-main',
			height: 150,
			position: {
				top: 50,
				left: 600
			}
		});
		createWindow('contact', {
			title: 'contact',
			active: false,
			template: 'skoupe-contact',
			position: {
				top: 125,
				left: 550
			}
		});
		createWindow('chat', {
			title: 'chat',
			active: false,
			template: 'skoupe-chat',
			height: 300,
			position: {
				top: 225,
				left: 550
			}
		});

		createWindow('notepad', {
			title: 'Bloc-Notes',
			template: 'notepad',
			visible: false,
			active: true,
			position: {
				top: 250,
				left: 450
			}
		});

		createWindow('themeSelector', {
			title: "Choix d'une thématique",
			template: 'theme-selector',
			active: false,
			modal: true,
			position: {
				top: 250,
				left: 250
			}
		});

		/*
		Timeout.then wrapper
		*/

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

			$scope.currentChat = {
				contact: "Medhi",
				discussion: []
			};
			$scope.openWin('chat');

			steps = [];

			addChat(1500, 'other', "Alors, tu as lancé Cuicuitter ?");
			addChat(1500, 'me', "Oui, je viens de le faire, mais je comprends rien... C’est quoi tous ces messages ?");

			addChat(1500, 'other', "Ca s’appelle des « Cuitts » ! C’est des messages très courts. Ils viennent s’afficher dans ta timeline dès que quelqu’un les poste.");
			addChat(1500, 'me', "Mais justement, qui les poste ?");
			addChat(1500, 'other', "Tout le monde ! Des stars, des sportifs, des pros de l’économie ou de la politique... Y en a pour tous les goûts ! En gros, il y a six grandes thématiques. Attends, je t’envoie la liste...");

			addStep(500, function() {
				$scope.openWin('notepad');
			});

			addChat(1500, 'me', "Ah merci ! Mais... tout ne m’intéresse pas, là-dedans. Tu sais que moi, ma passion, c’est...");

			addStep(500, function() {
				$scope.closeWin('notepad');
				$scope.openWin('themeSelector');
			});

			addStep(1500, function() {
				if (false && !prod) {
					var $choices = jQuery('#themeSelector :radio');
					$choices.eq(Math.round(Math.random() * $choices.length)).click();
					$log.log($scope.currentTheme);
					jQuery('#themeSelector button').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase2 = function() {

			$scope.closeWin('themeSelector');

			$log.log(">level1Phase2");

			$scope.currentTheme = jQuery('#themeSelector :checked').val();

			steps = [];

			addChat(1500, 'me', $scope.themes[$scope.currentTheme] + "! Si je veux trouver des infos sur ce sujet-là, je fais comment ?");
			addChat(1500, 'other', "Tu ouvres grands tes yeux... et tu fais marcher ton cerveau ! En lisant les Cuitts, tu pourras déterminer de quoi ils parlent.");

			addChat(1500, 'me', "Hum... pas facile !");
			addChat(1500, 'other', "Je vois. Si tu as un doute, tu peux faire une recherche pour vérifier la thématique de chaque Cuitt. Regarde : choisis-en un, n’importe lequel !");

			addStep(1500, function() {
				// show info popup
			});

			doSteps();

		};
		$scope.level1Phase2 = scenarii.level1Phase2;

		/*
		App is ready to go
		*/

		$timeout(function() {
			addCuit(true);
		}, 50);

		$timeout(function() {
			scenario();
		}, 500);

	});