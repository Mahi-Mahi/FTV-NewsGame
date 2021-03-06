'use strict';

angular.module('newsGameApp')
	.controller('PlayCtrl', function($document, $rootScope, $scope, $routeParams, $location, $log, prod, baseurl, $timeout, $interval, dataService, titleService, Xiti, Sound, utils, $localStorage) {

		$scope.debug = ($routeParams.debug === 'debug');
		$scope.fake = ($routeParams.debug === 'fake');
		$scope.skip = ($routeParams.debug === 'skip');
		$scope.fast = ($routeParams.debug === 'fast');

		Sound.init();

		$scope.$storage = $localStorage.$default({
			level: 1,
			scores: {}
		});

		titleService.setTitle('Play');

		Xiti.click(null, "chasseurs-infos::play::level-" + $scope.$storage.level);

		// debug config
		var delayModifier = ($scope.debug ? 0.05 : 1) * ($routeParams.debug === 'fast' ? 0.5 : 1);

		var chatDelay = dataService.data.settings.chatDelay;

		// reference to all windows on the desktop
		$scope.windows = {};

		// current difficulty level
		$scope.level = $scope.$storage.level;

		// Scoring
		$scope.scoring = dataService.data.settings.scoring;

		// TotalTime ( and RemainingTime ) are loaded from /data/settings.json
		$scope.totalTime = $scope.remainingTime = dataService.data.settings.totalTime['level-' + $scope.level];

		// all themes are loaded from /data/all.json
		$scope.themes = dataService.data.all.themes;

		$scope.actionsCost = dataService.data.settings.actionsCost;

		$scope.selectedTheme = null;

		$scope.showScoring = false;

		$rootScope.background = 'play-level-' + $scope.level;

		$scope.goto = function(path) {
			$location.path(path);
		};

		/*
		CuitCuiter
		*/

		// currently displayed cuits
		$scope.allCuits = [];
		$scope.cuits = [];

		// open Cuit source window
		var openSourceThemeCallback = false;
		$scope.openSource = function(id) {
			// $log.debug("openSource(" + id);
			Sound.play('click');
			$scope.closeWin('source');
			$scope.currentSource = dataService.data.all.sources[id];
			$scope.openWin('source');
			if (openSourceThemeCallback) {
				openSourceThemeCallback();
			}
		};

		// Verify source Theme ( + decrement time counter )
		var verifySourceThemeCallback = false;
		$scope.verifySourceTheme = function(id) {
			if (tutoAction && !verifySourceThemeCallback) {
				return;
			}
			if (!checkRemainingTime('verify-source-theme') && !tutoAction) {
				return;
			}

			Sound.play('click');
			dataService.data.all.sources[id].themeVerified = true;
			$scope.currentSource = dataService.data.all.sources[id];
			decrementTime('verify-source-theme', 'verify');
			applySourceTheme();
			if (verifySourceThemeCallback) {
				verifySourceThemeCallback();
			}
		};

		function applySourceTheme() {
			angular.forEach($scope.cuits, function(cuit, id) {
				var source = dataService.data.all.sources[$scope.cuits[id].source];
				if (source && source.themeVerified) {
					$scope.cuits[id].author = dataService.data.all.sources[cuit.source];
					$scope.cuits[id].themeVerified = true;
				}
			});
		}

		// Verify source Credibility ( + decrement time counter )
		var verifySourceCredibilityCallback = false;
		$scope.verifySourceCredibility = function(id) {
			if (tutoAction && !verifySourceCredibilityCallback) {
				return;
			}
			if (!checkRemainingTime('verify-source-credibility')) {
				return;
			}
			Sound.play('click');
			dataService.data.all.sources[id].credibilityVerified = true;
			$scope.currentSource = dataService.data.all.sources[id];
			decrementTime('verify-source-credibility', 'verify');
			applySourceCredibility();
			if (verifySourceCredibilityCallback) {
				verifySourceCredibilityCallback();
			}
		};

		function applySourceCredibility() {
			angular.forEach($scope.cuits, function(cuit, id) {
				var source = dataService.data.all.sources[$scope.cuits[id].source];
				if (source && source.credibilityVerified) {
					$scope.cuits[id].author = dataService.data.all.sources[cuit.source];
					$scope.cuits[id].credibilityVerified = true;
				}
			});
		}

		// add cuit to Cuicuiter timeline

		$scope.cuitsHover = false;
		$scope.cuitsOver = function() {
			$scope.cuitsHover = true;
		};
		$scope.cuitsOut = function() {
			$timeout(function() {
				$scope.cuitsHover = false;
			}, 1000);
		};

		function addCuit(next, force, author, theme, sources, credibility) {
			$log.debug("addCuit", next, force, author, theme, credibility);
			if (!force && $scope.skipCuits) {
				$timeout(function() {
					addCuit(true);
				}, ((Math.random() * chatDelay) + 1800) * delayModifier);
			} else {
				var added = false;
				// iterate through all cuits ( loaded from /data/all.json )
				var cuits = utils.shuffle(Object.keys(dataService.data.all.cuits));
				angular.forEach(cuits, function(cuitIdx) {
					var cuit = dataService.data.all.cuits[cuitIdx];

					// if cuit is not currenlty displayed
					if (!added && $scope.allCuits.indexOf(cuitIdx) === -1) {
						if ((!author && !theme && !sources && credibility === undefined) || cuit.source === author || cuit.theme === theme || (sources && sources.indexOf(cuit.source) > -1) || (cuit.credibility === credibility)) {

							cuit.author = dataService.data.all.sources[cuit.source];
							if (cuit.author) {
								cuit.themeVerified = cuit.author.themeVerified;
							}

							cuit.scoop = (Math.random() < cuit.exclusivity);
							cuit.visible = false;
							if (($scope.cuitsHover || $scope.newCuits) && !force) {
								$scope.newCuits = true;
							} else {
								$timeout(function() {
									// $scope.showCuits();
									cuit.visible = true;
								}, 1);
							}

							$scope.allCuits.push(cuitIdx);
							$scope.cuits.unshift(cuit);

							added = true;

							applySourceTheme();
							applySourceCredibility();

							// scheduled next cuit
							if (next) {
								$timeout(function() {
									addCuit(true);
								}, (Math.random() * chatDelay * delayModifier) + 1800);
							}
							selectedCuit = cuit;
						}
					}
				});
			}
		}
		$scope.addCuit = addCuit;

		$scope.showCuits = function(click) {
			$log.debug("showCuits");
			if (click) {
				Sound.play('click');
			}
			angular.forEach($scope.cuits, function(cuit) {
				if (cuit.visible === false) {
					$log.debug("show", cuit);
					cuit.visible = true;
				}
			});
			$scope.newCuits = false;
		};

		// Verify Cuit Theme ( + decrement time counter )
		var verifyCuitThemeCallback = false;
		$scope.verifyCuitTheme = function(cuit) {
			if (tutoAction && !verifyCuitThemeCallback) {
				return;
			}
			if (!checkRemainingTime('verify-cuit-theme') && !tutoAction) {
				return;
			}

			Sound.play('verification');
			$log.debug("verifyCuitTheme(" + cuit);
			selectedCuit = cuit;
			cuit.themeVerified = true;
			decrementTime('verify-cuit-theme', 'verify');
			if (verifyCuitThemeCallback) {
				verifyCuitThemeCallback();
			}
		};

		// Verify Cuit Credibility ( + decrement time counter )
		var verifyCuitCredibilityCallback = false;
		$scope.verifyCuitCredibility = function(cuit) {
			// $log.debug("verifyCuitCredibility(" + cuit);
			if (tutoAction && !verifyCuitCredibilityCallback) {
				return;
			}
			if (!checkRemainingTime('verify-cuit-credibility')) {
				return;
			}
			Sound.play('verification');
			selectedCuit = cuit;
			$scope.selectedCuit = selectedCuit;
			$scope.skipCuits = true;
			$scope.canCall = true;
			$scope.openWin('skoupe');
			callContactAction = updateCuitCredibility;
			if (verifyCuitCredibilityCallback) {
				verifyCuitCredibilityCallback();
				verifyCuitCredibilityCallback = null;
			}
		};

		function updateCuitCredibility(force) {
			$log.debug("updateCuitCredibility(", force);
			var details = [
				"J'ai fait quelques recherches et cette info est complètement bidon. Je vous déconseille de la publier !",
				"Cette info n'est pas vraiment crédible. Ne la publiez que si vous n'avez rien d'autre.",
				"Cette info est crédible. Vous pouvez la publier sans souci !",
				"Ah ! Voilà une super info ! Très crédible et intéressante… Foncez, publiez-la !"
			];

			if (force || selectedContact.themes.indexOf(selectedCuit.theme) !== -1) {
				decrementTime('verify-cuit-credibility', 'skoupe', details[selectedCuit.credibility], selectedCuit.credibility);
				selectedCuit.credibilityVerified = true;

				if (!force) {
					if (selectedCuit.credibility > 1) {
						Sound.play('feedbackGood');
					} else {
						Sound.play('feedbackBad');
					}
				}
			} else {
				decrementTime('verify-cuit-credibility', 'skoupe', "Je ne peux rien vous dire sur cette info… Sa thématique n'est pas ma spécialité.");
			}
			$scope.selectedCuit = null;
			$scope.skipCuits = false;
			$scope.canCall = false;
			contactVerify(force);
		}

		// Verify Cuit Exclusivity ( + decrement time counter )
		var verifyCuitExclusivityCallback = false;
		$scope.verifyCuitExclusivity = function(cuit) {
			if (!checkRemainingTime('verify-cuit-exclusivity')) {
				return;
			}
			$log.debug("verifyCuitExclusivity(" + cuit);
			Sound.play('verification');
			selectedCuit = cuit;
			$scope.selectedCuit = selectedCuit;
			$scope.skipCuits = true;
			$scope.canCall = true;
			$scope.openWin('skoupe');
			callContactAction = updateCuitExclusivity;
			if (verifyCuitExclusivityCallback) {
				verifyCuitExclusivityCallback();
				verifyCuitExclusivityCallback = null;
			}
		};

		function updateCuitExclusivity() {
			$log.debug("updateCuitExclusivity");
			if (selectedContact.themes.indexOf(selectedCuit.theme) !== -1) {
				if (selectedCuit.scoop) {
					Sound.play('feedbackGood');
				} else {
					Sound.play('feedbackBad');
				}
				decrementTime('verify-cuit-exclusivity', 'skoupe', selectedCuit.scoop ? "Incroyable ! Vous avez déniché un scoop ! Si cette info est crédible, publiez-la absolument !" : "Ah… Cette info n'est pas un scoop. Mais si elle est crédible, elle intéressera peut-être vos lecteurs.", selectedCuit.scoop ? 1 : 0);
				selectedCuit.exclusivityVerified = true;
				angular.forEach($scope.cuits, function(cuit, id) {
					if (cuit.id === selectedCuit.id) {
						$scope.cuits[id].exclusivityVerified = true;
					}
				});
			} else {
				decrementTime('verify-cuit-credibility', 'skoupe', "Je ne peux pas vous dire si cette info est un scoop… Sa thématique n'est pas ma spécialité.", -1);
			}
			$scope.selectedCuit = null;
			$scope.skipCuits = false;
			$scope.canCall = false;
			contactVerify();

		}

		function contactVerify(force) {
			Sound.play('click');
			var added = false;
			angular.forEach($scope.$storage.contacts, function(contact, key) {
				if (!added && (force || contact.id === selectedContact.id)) {
					$log.debug(contact.verifiedCuits);
					if (!contact.verifiedCuits) {
						$scope.$storage.contacts[key].verifiedCuits = [];
					}
					$log.debug(contact.themes.indexOf(selectedCuit.theme));
					$log.debug(contact.verifiedCuits.indexOf(selectedCuit.id));
					if (contact.themes.indexOf(selectedCuit.theme) !== -1 && contact.verifiedCuits.indexOf(selectedCuit.id) === -1) {
						$log.debug("added");
						$scope.$storage.contacts[key].verifiedCuits.push(selectedCuit.id);
						added = true;
					}
				}
			});
		}

		/*
		Skoupe
		*/

		// all contacts are loaded from /data/all.json
		if (!$scope.$storage.contacts) {
			$scope.$storage.contacts = []; //dataService.data.all.contacts;
		}

		if (!$scope.$storage.allContacts) {
			$scope.$storage.allContacts = [];
		}

		// current contact displayed in contact detail window
		$scope.currentContact = null;

		function addContact(theme) {
			$log.debug("addContact(", theme);
			var contacts = utils.shuffle(Object.keys(dataService.data.all.contacts));
			var added = false;
			angular.forEach(contacts, function(contactIdx) {
				var contact = dataService.data.all.contacts[contactIdx];
				if (!added && $scope.$storage.allContacts.indexOf(contactIdx) === -1) {
					if ((!theme) || contact.themes.indexOf(theme) !== -1) {
						contact.verifiedCuits = [];
						$scope.$storage.allContacts.push(contactIdx);
						$scope.$storage.contacts.unshift(contact);
						added = true;
					}
				}
			});
		}

		var newContactCallback;
		$scope.newContact = function() {
			Sound.play('click');
			$scope.openWin('themeSelector');
			$scope.themeSelectorAction = function() {
				addContact($scope.selectedTheme);
				$scope.closeWin('themeSelector');
				$scope.themeSelectorAction = null;
			};
			if (newContactCallback) {
				newContactCallback();
				newContactCallback = null;
			}

		};

		// open contact detail window
		$scope.openContact = function(id) {
			// $log.debug("openContact(" + id);
			Sound.play('click');
			$scope.closeWin('contact');
			$scope.currentContact = $scope.$storage.contacts[id];
			$scope.openWin('contact');
		};

		var callContactCallback;
		var callContactAction;
		var selectedContact;
		$scope.canCall = false;
		$scope.callContact = function(contact) {
			Sound.play('click');
			$log.debug("callContact(", contact.id);
			selectedContact = contact;
			if (callContactAction) {
				callContactAction();
				callContactAction = null;
			}
			if (callContactCallback) {
				callContactCallback();
				callContactCallback = null;
			}
		};

		// current chat displayed in chat window
		$scope.currentChat = null;

		// open chat window
		$scope.openChat = function(id) {
			// $log.debug("openChat(" + id);
			Sound.play('click');
			$scope.closeWin('chat');
			$scope.currentchatContact = $scope.chat[id];
			$scope.openWin('chat');
		};

		/*
		Timeline
		*/

		// decrement remaining time

		$scope.gaugeLevel = 'green';
		$scope.waiting = {
			active: false
		};

		function checkRemainingTime(action) {
			var duration = dataService.data.settings.actionsCost[action];
			return $scope.remainingTime > duration;
		}

		function decrementTime(action, type, detail, extra) {
			$log.debug("decrementTime(", action, type, detail, extra);

			// the cost of each actions are specified in /data/settings.json
			var duration = dataService.data.settings.actionsCost[action];

			if ($scope.tuto) {
				decrementedTime(duration);
			} else {
				$scope.waiting.active = true;
				$scope.waiting.action = action;
				$scope.waiting.type = type;
				$scope.waiting.extra = extra;
				$scope.waiting.detail = detail;
				$scope.waiting.duration = duration;
				$scope.waiting.level = 0;

				$log.debug($scope.waiting);

				var stop;

				stop = $interval(function() {
					if ($scope.waiting.level < 100) {
						$scope.waiting.level += 1;
					} else {
						$interval.cancel(stop);
						stop = undefined;
						$timeout(function() {
							decrementedTime(duration);
						}, 1000);
					}
				}, 1 * duration);
			}

		}

		function decrementedTime(duration) {

			$scope.waiting.active = false;

			$scope.remainingTime -= duration;
			if ($scope.remainingTime / $scope.totalTime <= 0.75) {
				$scope.gaugeLevel = 'lightgreen';
			}
			if ($scope.remainingTime / $scope.totalTime <= 0.5) {
				$scope.gaugeLevel = 'yellow';
			}
			if ($scope.remainingTime / $scope.totalTime <= 0.25) {
				$scope.gaugeLevel = 'orange';
			}
			if ($scope.remainingTime / $scope.totalTime <= 0.15) {
				$scope.gaugeLevel = 'red';
			}
			jQuery(".timeline").css({
				'z-index': 99999
			});
			$timeout(function() {
				jQuery(".timeline").css({
					'z-index': 999
				});
			}, 2000);
			$log.debug($scope.remainingTime, " <= ", $scope.totalTime / 2);
			if ($scope.remainingTime + duration > $scope.totalTime / 2 && $scope.remainingTime <= $scope.totalTime / 2) {
				// feedback('bad', "Plus que 50% du temps<br />Attention ! La journée est déjà à moitié écoulée ! N'oubliez pas de publier des informations ou vos lecteurs seront déçus.");
			}
			if ($scope.remainingTime + duration > $scope.totalTime / 4 && $scope.remainingTime <= $scope.totalTime / 4) {
				// feedback('bad', "Plus que 25% du temps<br />Vous n'avez presque plus de temps, la journée touche bientôt à sa fin. Si ce n'est pas déjà fait, vous devriez vite publier des informations.");
			}
			if ($scope.remainingTime <= 0) {

				promptEndDay();

			}

		}

		function promptEndDay() {

			$scope.promptNoCancel = true;
			promptCallback = function() {

				$log.debug("endDay");

				$scope.closeWin('prompt');
				promptCallback = null;

				doEndDay();
			};

			$scope.promptContent = "Votre journée est terminée.<br />Avez-vous bien travaillé ?";
			$scope.openWin('promptEndDay');

		}

		/*
		Generic Prompt
		*/
		var promptCallback;
		$scope.promptCancel = function() {
			promptCallback = null;
			$scope.closeWin('prompt');
		};
		$scope.promptConfirm = function() {
			if (promptCallback) {
				promptCallback();
			}
		};

		/*
		Generic Window Management
		*/

		$scope.tooltip = {
			active: false,
			content: 'Quisque id neque scelerisque velit.',
			_pos: {},
			position: function($elt, top, left) {
				if ($elt) {
					this._pos = {
						elt: $elt,
						top: top,
						left: left
					};
				}
				if (this._pos.elt) {
					jQuery('#tooltip').css({
						top: this._pos.elt.offset().top + this._pos.top,
						left: this._pos.elt.offset().left + this._pos.left
					});
				}
			}
		};
		$interval(function() {
			$scope.tooltip.position();
		}, 50);

		// create a new window (KendoUI will automattically instatiate ir)

		function createWindow(id, args) {
			$scope.windows[id] = angular.extend({
				visible: false,
				active: true,
				actions: ['Close'],
				resizable: false,
				modal: false,
				width: 400,
				height: 400,
				position: {
					top: 300,
					left: 300
				}
			}, args);
			$timeout(function() {
				jQuery('#' + id).data('kendoWindow').bind('activate', function() {
					jQuery('#' + id).parent().attr('id', 'win-' + id);
				});
			}, 50);
		}

		// show/hide window
		$scope.toggleWin = function(id) {
			Sound.play('click');
			if ($scope.windows[id].visible) {
				$scope.closeWin(id);
			} else {
				$scope.openWin(id);
			}
		};
		$scope.openWin = function(id, options) {
			$log.debug("openWin(", id);
			if (!$scope.windows[id].visible) {
				if (jQuery('#' + id).data('kendoWindow')) {
					jQuery('#' + id).data('kendoWindow').open();
				}
				$scope.setOptionsWin(id, {
					dragend: function() {
						$scope.tooltip.position();
					}
				});
				if (id === 'chat') {
					Sound.play('skoupeMsg');
				}

			}
			jQuery('#' + id).data('kendoWindow').toFront();
			if (options) {
				$scope.setOptionsWin(id, options);
			}
		};
		$scope.closeWin = function(id) {
			if ($scope.windows[id].visible) {
				jQuery('#' + id).data('kendoWindow').close();
			}
		};
		$scope.setOptionsWin = function(id, options) {
			jQuery('#' + id).data('kendoWindow').setOptions(options);
		};

		/*
		Initialisation
		*/

		createWindow('cuicuiter', {
			title: 'Cuicuiter',
			visible: false,
			template: 'cuicuiter-main',
			height: 505,
			position: {
				top: 35,
				left: 20
			}
		});
		createWindow('source', {
			title: 'Profil Cuicuiter',
			active: false,
			template: 'cuicuiter-source',
			width: 400,
			height: 240,
			position: {
				top: 125,
				left: 250
			}
		});

		createWindow('skoupe', {
			title: 'Skoupe',
			visible: false,
			active: true,
			template: 'skoupe-main',
			height: 200,
			position: {
				top: 70,
				left: 600
			}
		});

		createWindow('contact', {
			title: 'Contact',
			active: false,
			visible: false,
			template: 'skoupe-contact',
			height: 245,
			position: {
				top: 125,
				left: 550
			}
		});

		if (!$scope.skip) {
			createWindow('chat', {
				title: 'Conversation',
				active: true,
				template: 'skoupe-chat',
				height: 300,
				position: {
					top: 225,
					left: 600
				}
			});
		}

		createWindow('notepad', {
			title: 'Bloc-Notes',
			template: 'notepad',
			visible: true,
			active: true,
			height: 220,
			position: {
				top: 50,
				left: 450
			}
		});

		createWindow('themeSelector', {
			title: "Choix d'une thématique",
			template: 'theme-selector',
			active: false,
			actions: [],
			modal: true,
			height: 260,
			position: {
				top: 250,
				left: 250
			}
		});

		createWindow('prompt', {
			title: "Avertissement",
			template: 'prompt',
			active: false,
			actions: [],
			modal: true,
			height: 130,
			width: 220,
			position: {
				top: '45%',
				left: '45%'
			}
		});

		createWindow('promptEndDay', {
			title: "Avertissement",
			template: 'prompt',
			active: false,
			actions: [],
			modal: true,
			height: 150,
			width: 220,
			position: {
				top: '45%',
				left: '45%'
			}
		});

		if ($scope.level === 2) {
			createWindow('blog', {
				title: 'Mon blog',
				active: true,
				template: 'blog',
				height: 360,
				width: 385,
				position: {
					top: 250,
					left: 550
				}
			});
		}

		if ($scope.level === 3) {
			createWindow('blog', {
				title: "L'international",
				active: true,
				template: 'publish_lite',
				height: 360,
				width: 385,
				position: {
					top: 250,
					left: 550
				}
			});
		}

		if ($scope.level === 4) {
			createWindow('publish', {
				title: "L'International",
				active: true,
				template: 'publish',
				height: 600,
				width: 500,
				position: {
					top: 150,
					left: 450
				}
			});
		}

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
			addStep(delay, function() {
				$scope.openWin('chat');
				if (speaker !== 'other') {
					Sound.play('skoupeText');
				}
				$scope.currentChat.status = ((speaker === 'other') ? 'reading' : 'writing');
				var $container = angular.element(document.getElementById('chat-scroll'));
				var chatBottom = angular.element(document.getElementById('chat-bottom'));
				$container.scrollToElement(chatBottom, 30, 100);
			});
			addStep(delay - 400, function() {
				$scope.currentChat.discussion.push({
					speaker: speaker,
					content: content
				});
				$scope.currentChat.status = '';
				$timeout(function() {
					var $container = angular.element(document.getElementById('chat-scroll'));
					var chatBottom = angular.element(document.getElementById('chat-bottom'));
					$container.scrollToElement(chatBottom, 30, 100);
				}, 50);
			});
		}

		/*
		Scenarii
		*/

		$scope.tuto = false;

		function endTuto() {
			$log.debug("endTuto");
			$scope.skipCuits = false;
			$scope.tuto = false;
			tutoAction = null;
		}
		$scope.endTuto = endTuto;

		function scenario() {
			if (scenarii['level' + $scope.level]) {
				$scope.tuto = true;
				scenarii['level' + $scope.level]();
			}
		}

		var scenarii = {};

		var tutoAction = null;

		// Level 1
		scenarii.level1 = function() {
			$log.debug(">scenario1");

			tutoAction = true;

			$scope.currentChat = {
				contact: "Mehdi",
				discussion: []
			};

			steps = [];

			addStep(500, function() {
				$scope.openWin('cuicuiter');
				addCuit(false, true);
				addCuit(false, true);
				addCuit(false, true);
				addCuit(false, true);
			});

			addStep(chatDelay, function() {
				$scope.openWin('chat');
			});

			addChat(chatDelay, 'other', "Alors, tu as lancé Cuicuitter ?");
			addChat(chatDelay, 'me', "Oui, je viens de le faire, mais je comprends rien... C’est quoi tous ces messages ?");

			addChat(chatDelay, 'other', "Ca s’appelle des « Cuitts » ! C’est des messages très courts. Ils viennent s’afficher dans ta timeline dès que quelqu’un les poste.");
			addChat(chatDelay, 'me', "Mais justement, qui les poste ?");
			addChat(chatDelay, 'other', "Tout le monde ! Des stars, des sportifs, des pros de l’économie ou de la politique... Y en a pour tous les goûts ! En gros, il y a six grandes thématiques. Attends, je t’envoie la liste...");

			addStep(1500, function() {
				$scope.openWin('notepad');
			});

			addChat(5500 + chatDelay, 'me', "Ah merci ! Mais... tout ne m’intéresse pas, là-dedans. Tu sais que moi, ma passion, c’est...");

			addStep(1500, function() {
				$scope.closeWin('notepad');
				$scope.openWin('themeSelector');
				$scope.themeSelectorAction = function() {
					$log.debug("themeSelectorAction");
					$scope.$storage.chosenTheme = $scope.selectedTheme;
					$scope.$storage.chosenTheme = $scope.$storage.chosenTheme;
					$scope.closeWin('themeSelector');
					scenarii.level1Phase2();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					var $choices = jQuery('#themeSelector :radio');
					$choices.eq(Math.round(Math.random() * $choices.length)).click();
					jQuery('#themeSelector button').click();
					$scope.$storage.chosenTheme = 'politique';
				}
			});

			doSteps();

		};

		scenarii.level1Phase2 = function() {

			$log.debug(">level1Phase2 : " + $scope.$storage.chosenTheme);

			steps = [];

			tutoAction = true;

			addChat(500, 'me', $scope.themes[$scope.$storage.chosenTheme] + "&nbsp;! Si je veux trouver des infos sur ce sujet-là, je fais comment ?");
			addChat(chatDelay, 'other', "Tu ouvres grands tes yeux... et tu fais marcher ton cerveau ! En lisant les Cuitts, tu pourras déterminer de quoi ils parlent.");

			addChat(chatDelay, 'me', "Hum... pas facile !");
			addChat(chatDelay, 'other', "Je vois. Si tu as un doute, tu peux faire une recherche pour vérifier la thématique de chaque Cuitt. Regarde, clique sur celui-ci !");

			addStep(chatDelay, function() {
				// show info popup
				$scope.skipCuits = true;
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 50, 20);
				$scope.tooltip.orientation = "top left";
				$scope.tooltip.active = true;
				verifyCuitThemeCallback = function() {
					scenarii.level1Phase3();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					// jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.theme button').click();
				}
			});

			doSteps();

		};

		var selectedCuit;
		scenarii.level1Phase3 = function() {

			// $scope.skipCuits = false;
			$scope.tooltip.active = false;
			verifyCuitThemeCallback = false;

			$log.debug(">level1Phase3");

			steps = [];

			addChat(chatDelay, 'other', "Et voilà ! Tu vois, ça a pris un peu de temps mais ça en valait la peine ! Maintenant, tu sais que ce cuitt parle de " + $scope.themes[selectedCuit.theme] + ".");
			addChat(chatDelay, 'other', "Tu vois, c’est signalé par le petit picto qui a remplacé le point d’interrogation en dessous du message !");

			if (selectedCuit.theme === $scope.$storage.chosenTheme) {
				addChat(chatDelay, 'me', "Ah, géniale, cette info ! Justement ce qui m’intéresse !");
			} else {
				addChat(chatDelay, 'me', "Ah ouais... Pas mal, cette info, mais, moi, ce qui m’intéresse, c’est " + $scope.themes[$scope.$storage.chosenTheme] + ".");
			}
			addChat(chatDelay, 'other', "Ce qui est cool avec Cuicuitter, c’est que je suis sûr qu’en fouillant dans la timeline, tu peux trouver un autre cuit qui parle de " + $scope.themes[$scope.$storage.chosenTheme] + ". A toi de jouer !");

			addStep(chatDelay, function() {
				// show info popup
				addCuit(false, true);
			});

			addStep(chatDelay, function() {
				$scope.skipCuits = true;
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 50, 20);
				$scope.tooltip.orientation = "top left";
				$scope.tooltip.active = true;
				verifyCuitThemeCallback = function() {
					scenarii.level1Phase4();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.theme button').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase4 = function() {

			$scope.skipCuits = false;
			$scope.tooltip.active = false;
			verifyCuitThemeCallback = false;

			$log.debug(">level1Phase4");

			steps = [];

			if (selectedCuit.theme === $scope.$storage.chosenTheme) {
				scenarii.level1Phase5();
				return;
			} else {
				verifyCuitThemeCallback = function() {
					scenarii.level1Phase4();
				};

				addChat(chatDelay, 'me', "Ah... ce Cuitt-là ne m’intéresse pas trop. Attends, j’en cherche un autre !");
				addStep(chatDelay, function() {
					// show info popup
					$scope.cuitsHover = false;
					$scope.newCuits = false;
					addCuit(false, true, null, $scope.$storage.chosenTheme);
					/*
					var nbCuits = Math.round(Math.random() * 3);
					while (nbCuits--) {
						$timeout(function() {
							addCuit(false, true);
						}, Math.round(500 + Math.random() * 500));
					}
					*/
				});
				addStep(chatDelay, function() {
					$scope.skipCuits = true;
					$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
					$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 50, 20);
					$scope.tooltip.orientation = "top left";
					$scope.tooltip.active = true;
				});
			}

			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.theme button').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase5 = function() {

			$scope.tooltip.active = false;
			verifyCuitThemeCallback = false;

			$log.debug(">level1Phase5");

			steps = [];

			addChat(chatDelay, 'me', "Ouah, génial ! C’est super intéressant ce truc&nbsp;!");
			addChat(chatDelay, 'other', "T’as vu ? J’apprends plein d’infos de première fraîcheur depuis que je m’en sers... ");
			addChat(chatDelay, 'other', "Bon, il y a aussi des trucs un peu bidon, mais en général, quand tu vérifies qui poste, tu peux savoir si c’est du solide ou pas...");
			addChat(chatDelay, 'me', "Ah ? Comment on fait ça ?");
			addChat(chatDelay, 'other', "Ben, pour voir la fiche de quelqu’un, il faut cliquer sur sa photo d’avatar ou sur son nom d’utilisateur.");
			addStep(chatDelay, function() {
				addCuit(false, true);
				addCuit(false, true, null, $scope.$storage.chosenTheme);
				addCuit(false, true);
			});
			addChat(chatDelay, 'other', "Regarde, tu vois le compte qui vient de poster trois messages ? Tu peux cliquer sur sa photo...");
			addStep(chatDelay, function() {
				// add new cuits
				$scope.skipCuits = true;
				var authors = Object.keys(dataService.data.all.sources);
				var author = authors[Math.round(Math.random() * authors.length)];
				addCuit(false, true, author);
				addCuit(false, true, author);
				addCuit(false, true, author);
			});
			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez sur le profil de l'auteur";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.source'), -100, -50);
				$scope.tooltip.orientation = "bottom left";
				$scope.tooltip.active = true;
				openSourceThemeCallback = function() {
					scenarii.level1Phase6();
				};
			});
			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.source').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase6 = function() {

			$scope.tooltip.active = false;
			verifyCuitThemeCallback = false;
			openSourceThemeCallback = false;

			$log.debug(">level1Phase6");

			steps = [];

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Analyser la source</strong>";
				$scope.tooltip.position(jQuery('#source .metas .theme button'), 80, -30);
				$scope.tooltip.orientation = "top left";
				$scope.tooltip.active = true;
				verifySourceThemeCallback = function() {
					scenarii.level1Phase7();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					// jQuery('#source .metas .theme button').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase7 = function() {

			$scope.tooltip.active = false;
			verifySourceThemeCallback = false;

			$log.debug(">level1Phase7");

			steps = [];

			addChat(chatDelay, 'me', "Ouah, trop cool !");
			addChat(chatDelay, 'other', "T’as vu ? Analyser une source, ça prend du temps, mais après tu connais la thématique de chacun de ses Cuitts !");
			addChat(chatDelay, 'me', "C’est génial, Cuicuitter ! Ca doit être un super outil pour les journalistes, ça !");
			addChat(chatDelay, 'other', "Carrément !");
			addChat(chatDelay, 'me', "Tiens, mais d’ailleurs... Journaliste... Voilà un métier qui me plairait à fond !");

			addChat(chatDelay, 'other', "Ah ouais ? Cool ! Ben voilà, plus besoin de te prendre la tête, tu sais quoi mettre sur ta fiche d’orientation ! Mais tu vas devoir apprendre à maîtriser Cuicuitter à mort, alors !");

			addStep(7000, function() {
				// show scoring
				updateScore();
				showScoring();
				tutoAction = null;
			});

			doSteps();

		};

		// Level 2
		scenarii.level2 = function() {
			$log.debug(">scenario2");

			tutoAction = true;

			var themedSources = [];
			var otherSources = [];

			angular.forEach(dataService.data.all.sources, function(source, key) {
				if (source.themes.indexOf($scope.$storage.chosenTheme) > -1 && themedSources.length < 5) {
					themedSources.push(key);
				}
				if (source.themes.indexOf($scope.$storage.chosenTheme) === -1 && otherSources.length < 5) {
					otherSources.push(key);
				}
			});

			addCuit(true, null, null, null, themedSources.concat(otherSources));

			$scope.currentChat = {
				contact: "Mehdi",
				discussion: []
			};

			steps = [];

			addStep(50, function() {
				$scope.openWin('cuicuiter');
			});

			addStep(chatDelay, function() {
				$scope.openWin('chat');
			});

			addChat(chatDelay, 'other', "Salut !");
			addChat(chatDelay, 'me', "Salut ! Ca roule ?");
			addChat(chatDelay, 'other', "Bien, et toi ? Alors, tu révises le concours pour les écoles de journalisme ?");
			addChat(chatDelay, 'me', "Pfff... M’en parle pas, c’est crevant x_x. En plus, j’ai ouvert un blog pour m’entrainer à écrire des articles...");
			addChat(chatDelay, 'other', "Ah bon ? Un blog ? Cool ! Sur quel sujet&nbsp;?");
			addChat(chatDelay, 'me', "Sur " + $scope.themes[$scope.$storage.chosenTheme] + ".");
			addChat(chatDelay, 'other', "Ah, j’aurais dû m’en douter ! C’est super ! Comment tu fais pour trouver des sujets ?");
			addChat(chatDelay, 'me', "J’utilise Cuicuitter ! Mais je dois faire gaffe. Si je veux que mes lecteurs soient contents, j’ai intérêt à choisir des infos sur la bonne thématique...");
			addChat(chatDelay, 'other', "Et comment tu fais pour le savoir ?");
			addChat(chatDelay, 'me', "J’analyse chaque info...");
			addChat(chatDelay, 'other', "Tu peux aussi analyser les sources directement en cliquant sur les photos des utilisateurs, tu sais ?");
			addChat(chatDelay, 'me', "Oui ! C’est vrai, c’est très efficace, même si ça prend plus de temps... Allez, d’ailleurs je te laisse, il faut que je me mette au travail.");
			addChat(chatDelay, 'other', "Ok/ Bon courage ;-)");

			addStep(2500, function() {
				$scope.closeWin('chat');
			});

			addStep(500, function() {
				// show info popup
				$scope.tooltip.content = "Choisissez des infos dans votre fil Cuicuitter et publiez-les sur votre blog. Attention : choisissez-les bien dans la thématique " + $scope.themes[$scope.$storage.chosenTheme] + ". Et faites attention : le temps passe vite ! ";
				$scope.tooltip.position(jQuery('#cuicuiter'), 100, 270);
				$scope.tooltip.orientation = "top left";
				$scope.tooltip.active = true;
				$scope.openWin('blog');
			});

			addStep(5000, function() {
				$scope.tooltip.active = false;
				endTuto();
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					var i = 6; //2 + Math.round(Math.random() * 3);
					var max = 10;
					while (i && max) {
						$log.debug("debug", i, max);
						addCuit(false, true);
						var cuit = Math.floor(Math.random() * Object.keys($scope.cuits).length);
						if (!$scope.cuits[cuit].published) {
							$scope.publishCuit($scope.cuits[cuit], true);
							i--;
						}
						max--;
					}
					scenarii.level2End();
				}
			});

			doSteps();

		};

		scenarii.level2End = function() {
			$log.debug(">level2End");

			showScoring();
		};

		// Level 3
		scenarii.level3 = function() {
			$log.debug(">scenario3");

			tutoAction = true;

			// $scope.skipCuits = true;

			$scope.$storage.contacts = []; //dataService.data.all.contacts;
			$scope.$storage.allContacts = []; //dataService.data.all.contacts;

			if ($scope.$storage.savedContacts) {
				$scope.$storage.contacts = $scope.$storage.savedContacts;
				$scope.$storage.allContacts = $scope.$storage.savedAllContacts;
			} else {
				addContact();
				addContact($scope.$storage.chosenTheme);
				addContact($scope.$storage.mandatoryTheme);
				$scope.$storage.savedContacts = $scope.$storage.contacts;
				$scope.$storage.savedAllContacts = $scope.$storage.allContacts;
			}

			$scope.currentChat = {
				contact: "Sonia",
				discussion: []
			};

			steps = [];

			addStep(50, function() {
				$scope.openWin('cuicuiter');
			});

			addStep(chatDelay, function() {
				$scope.openWin('chat');
			});

			addChat(chatDelay, 'other', "Vous êtes connecté(e) ?");
			addChat(chatDelay, 'me', "Oui, ça y est !");
			addChat(chatDelay, 'other', "Alors je vais vous montrer comment vérifier une info. Commencez par vérifier la thématique d'un cuit.");

			addStep(chatDelay, function() {
				addCuit(false, true, null, $scope.$storage.chosenTheme);
				addCuit(false, true, null, $scope.$storage.chosenTheme);
			});
			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 50, 20);
				$scope.tooltip.orientation = "top left";
				$scope.tooltip.active = true;
				verifyCuitThemeCallback = function() {
					$scope.tooltip.active = false;
					scenarii.level3Phase2();
					verifyCuitThemeCallback = null;
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.theme button').click();
				}
			});

			doSteps();

		};

		scenarii.level3Phase2 = function() {
			$log.debug(">scenario3Phase2");
			steps = [];
			addChat(chatDelay, 'other', "Très bien ! Vous avez vu, ça parle de " + $scope.themes[selectedCuit.theme] + "... Ca pourrait intéresser nos lecteurs ! Mais il faut vérifier que l’info est bien crédible. C’est à ça que sert le nouveau bouton qui vient d’apparaître. Cliquez dessus.");

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la crédibilité</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-credibility").first().find('.metas .credibility button'), 50, 20);
				$scope.tooltip.orientation = "top left";
				$scope.tooltip.active = true;
				verifyCuitCredibilityCallback = function() {
					$scope.tooltip.active = false;
					scenarii.level3Phase3();
					verifyCuitCredibilityCallback = null;
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#cuicuiter .cuit').not(".verified-credibility").first().find('.credibility button').click();
				}
			});
			doSteps();
		};

		scenarii.level3Phase3 = function() {
			$log.debug(">scenario3Phase3");
			steps = [];

			addStep(50, function() {
				$scope.openWin('skoupe');
				addContact();
				if ($scope.$storage.contacts.length < 3) {
					addContact(selectedCuit.theme);
					addContact($scope.$storage.chosenTheme);
					addContact($scope.$storage.mandatoryTheme);
				}
			});

			$scope.openWin('chat', {
				position: {
					left: 250,
					top: 250
				}
			});

			addChat(chatDelay, 'other', "Pour vérifier une info, vous devez contacter quelqu’un en qui vous avez confiance. J’ai rajouté trois personnes dans votre carnet d’adresses. Mais attention ! Il faut que vous choisissiez un contact qui s’y connaît dans la thématique " + $scope.themes[selectedCuit.theme] + ". A vous de jouer !");

			addStep(chatDelay, function() {
				// show info popup
				$scope.openWin('skoupe');
			});
			addStep(chatDelay, function() {
				$scope.tooltip.content = "Choisissez un contact, et cliquez sur le bouton 'Appeler'";
				$scope.tooltip.position(jQuery('#skoupe .inner__body .inner-item').first(), -160, -240);
				$scope.tooltip.orientation = "bottom right";
				$scope.tooltip.active = true;
				callContactCallback = function() {
					scenarii.level3Phase4();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					var contact = utils.shuffle($scope.$storage.contacts)[0];
					// $scope.callContact(contact);
				}
			});

			doSteps();
		};

		scenarii.level3Phase4 = function() {
			$log.debug(">scenario3Phase4");
			steps = [];

			if (selectedContact.themes.indexOf(selectedCuit.theme) === -1) {
				addChat(chatDelay, 'other', "Eh non ! Ce contact n’est pas spécialiste de " + $scope.themes[selectedCuit.theme] + ". Regardez bien les petites icônes dans la colonne « Thématique » de votre carnet d’adresses. Allez, choisissez un autre contact !");
				addStep(chatDelay, function() {
					// show info popup
					$scope.canCall = true;
					$scope.openWin('skoupe');
					$scope.tooltip.content = "Choisissez un contact, et cliquez sur le bouton 'Appeler'";
					$scope.tooltip.position(jQuery('#skoupe .inner'), 0, 100);
					$scope.tooltip.active = true;
					callContactCallback = function() {
						scenarii.level3Phase4();
					};
				});
				addStep(chatDelay, function() {
					if ($scope.debug) {
						// var contact = utils.shuffle($scope.$storage.contacts)[0];
						// $scope.callContact(contact);
					}
				});
			} else {
				$scope.canCall = false;
				$scope.tooltip.active = false;
				addChat(chatDelay, 'other', "Bravo ! Vous voyez, maintenant, vous connaissez la crédibilité de l’info. Il y a quatre niveaux possibles, de 0 étoiles pour une info pas crédible à trois étoiles pour une super info. A vous de décider si vous la publiez ou pas !");
				addChat(chatDelay, 'me', "Je vois... Et je peux demander à mes contacts d’évaluer la crédibilité d’une source ?");
				addChat(chatDelay, 'other', "Bien sûr ! En cliquant sur une photo d’avatar ou sur un nom dans le fil Cuicuitter, vous pourrez vérifier la crédibilité de n’importe qui. Mais il faudra d’abord analyser la source, pour savoir quelles sont ses thématiques préférées.");
				addChat(chatDelay, 'me', "Ah... Ca n’a pas l’air facile !");
				addChat(chatDelay, 'other', "Le mieux, c’est d’apprendre en faisant. Alors je vous laisse essayer. N’oubliez pas de publier des infos qui parlent de " + $scope.themes[$scope.$storage.chosenTheme] + " ou de " + $scope.themes[$scope.$storage.mandatoryTheme] + ". Bonne journée !");
				addStep(2500, function() {
					$scope.closeWin('chat');
					$scope.openWin('blog');

					var chosenThemedSources = [];
					var mandatoryThemedSources = [];
					var otherSources = [];

					angular.forEach(dataService.data.all.sources, function(source, key) {
						if (source.themes.indexOf($scope.$storage.chosenTheme) > -1 && chosenThemedSources.length < 5) {
							chosenThemedSources.push(key);
						}
						if (source.themes.indexOf($scope.$storage.mandatoryTheme) > -1 && mandatoryThemedSources.length < 5) {
							mandatoryThemedSources.push(key);
						}
						if (source.themes.indexOf($scope.$storage.chosenTheme) === -1 && otherSources.length < 8) {
							otherSources.push(key);
						}
					});

					addCuit(true, null, null, null, chosenThemedSources.concat(mandatoryThemedSources).concat(otherSources));

					$scope.skipCuits = false;
					verifyCuitCredibilityCallback = null;
					callContactCallback = null;
					endTuto();
				});
			}

			doSteps();
		};

		scenarii.level3End = function() {
			$log.debug(">level3End");
			showScoring();
		};

		// Level 4
		scenarii.level4 = function() {
			$log.debug(">scenario4");

			tutoAction = true;

			$scope.skipCuits = true;

			$scope.currentChat = {
				contact: "Sonia",
				discussion: []
			};

			steps = [];

			addStep(50, function() {
				$scope.openWin('cuicuiter');
				$scope.openWin('publish');
				$scope.openWin('chat', {
					position: {
						left: 100,
						top: 300
					}
				});
			});

			addStep(50, function() {
				var i;
				for (i = 0; i < 7; i++) {
					addCuit(false, true);
				}
				addCuit(false, true, null, null, null, 1);
				$scope.selectedCuit = selectedCuit;
				addContact(selectedCuit.theme);
				selectedContact = $scope.$storage.contacts[0];
				selectedCuit.themeVerified = true;
				updateCuitCredibility(true);
			});
			addStep(chatDelay, function() {
				scenarii.level4Phase2();
			});
			doSteps();
		};

		scenarii.level4Phase2 = function() {
			$log.debug(">scenario4Phase2");

			steps = [];

			addChat(chatDelay, 'other', "Vous êtes connecté(e) ?");
			addChat(chatDelay, 'me', "C’est bon !");
			addChat(chatDelay, 'other', "Très bien. Alors vous voyez ce gros bloc, en bas à droite ?");
			addChat(chatDelay, 'me', "Absolument...");
			addChat(chatDelay, 'other', "C’est la maquette de notre site Internet. La zone la plus grande, en haut, est l’endroit où on publie l’article de Une – si tu as une super info, il faut absolument la mettre là.");
			addChat(chatDelay, 'me', "Mais comment puis-je savoir si...");
			addChat(chatDelay, 'other', "Ne soyez pas impatient ! J’en finis avec la maquette : les deux blocs d’articles moyens, sous la Une, sont réservés à des sujets un peu moins importants. Et les trois petites brèves, sur la droite, c’est pour que toutes les thématiques puissent être représentées, puisqu’il y a 6 emplacements en tout.");
			addChat(chatDelay, 'other', "Votre rôle va donc être de remplir ces 6 emplacements avec des infos que vous aurez récupérées sur Cuicuitter... ");
			addChat(chatDelay, 'other', "Une fois que la maquette est pleine, vous publiez le tout, et voilà le travail !");
			addChat(chatDelay, 'me', "Bien compris, chef ! Mais comment savoir si une info est plus importante qu’une autre ?");
			addChat(chatDelay, 'other', "D’abord, plus une info est crédible, plus elle est bonne. Et vous savez déjà vérifier la crédibilité d’une info, n’est-ce pas ?");
			addChat(chatDelay, 'me', "Oui chef !");
			addChat(chatDelay, 'other', "Mais surtout, vous devez essayer de trouver des scoops !");
			addChat(chatDelay, 'me', "Des scoops ?");
			addChat(chatDelay, 'other', "Oui ! Des infos exclusives, qu’aucun autre site n’a déjà publiées ?");
			addChat(chatDelay, 'me', "Et comment faire pour savoir si une info est un scoop ?");
			addChat(chatDelay, 'other', "Regardez par exemple ce cuitt : j’ai déjà déterminé qu’il parlait de " + $scope.themes[selectedCuit.theme] + ", et que l’info n’était pas très crédible... Maintenant, cliquez sur le bouton qui est apparu en dessous.");

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier l'exclusivité</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-exclusivity").first().find('.metas .exclusivity button'), -100, 20);
				$scope.tooltip.orientation = 'bottom left';
				$scope.tooltip.active = true;
				verifyCuitExclusivityCallback = function() {
					scenarii.level4Phase3();
					verifyCuitExclusivityCallback = null;
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					// jQuery('#cuicuiter .cuit').not(".verified-exclusivity").first().find('.exclusivity button').click();
				}
			});

			doSteps();

		};

		scenarii.level4Phase3 = function() {
			$log.debug(">scenario4Phase3");
			steps = [];

			$scope.tooltip.active = false;

			$scope.openWin('skoupe');

			addChat(chatDelay, 'other', "Pour vérifier le niveau d’exclusivité d’une info, vous devez demander de l’aide à vos contacts.");
			addChat(chatDelay, 'me', "Ah... Mais le contact que j’ai dans cette thématique semble indisponible.");
			addChat(chatDelay, 'other', "Eh oui... C’est parce que c’est à lui que j’ai déjà demandé de vérifier la crédibilité de cette info. Vous ne pouvez pas demander au même contact de vérifier à la fois la crédibilité et l’exclusivité d’une info. Il faut demander à quelqu’un d’autre : ça s’appelle « recouper ses sources » !");
			addChat(chatDelay, 'me', "Très bien... Mais personne d’autre dans mon carnet d’adresses n’est spécialiste de " + $scope.themes[selectedCuit.theme] + " !");
			addChat(chatDelay, 'other', "Dans ce cas, vous allez devoir trouver une nouvelle source ! Pour le faire, cliquez ici...");

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Nouveaux contacts</strong>";
				$scope.tooltip.position(jQuery('#skoupe #new-contact'), 50, -200);
				$scope.tooltip.orientation = "top right";
				$scope.tooltip.active = true;

				var $container = angular.element(document.getElementById('skoupe'));
				var $contactBottom = angular.element(document.getElementById('new-contact'));

				$container.scrollToElement($contactBottom, 30, 100);

				newContactCallback = function() {
					scenarii.level4Phase4();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					// jQuery('#new-contact').click();
				}
			});

			doSteps();
		};
		scenarii.level4Phase4 = function() {
			$log.debug(">scenario4Phase4");
			steps = [];

			$scope.tooltip.active = false;

			addChat(chatDelay, 'other', "Super ! Maintenant, choisissez la thématique " + $scope.themes[selectedCuit.theme] + " dans la liste.");

			addStep(2500, function() {
				$scope.selectedTheme = selectedCuit.theme;
				$scope.openWin('themeSelector');

				$scope.themeSelectorAction = function() {
					addContact($scope.selectedTheme);
					$scope.closeWin('themeSelector');
					$scope.themeSelectorAction = null;
					scenarii.level4Phase5();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					$scope.themeSelectorAction();
				}
			});

			doSteps();
		};

		scenarii.level4Phase5 = function() {
			$log.debug(">scenario4Phase5");
			steps = [];

			$scope.tooltip.active = false;

			addChat(chatDelay, 'other', "Et voilà ! Vous avez maintenant un nouveau contact ! Vous pouvez vous en servir pour vérifier l’exclusivité de l’info !");

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Appelez votre contact";
				$scope.tooltip.position(jQuery('#skoupe'), -50, -150);
				$scope.tooltip.orientation = "bottom right";
				$scope.tooltip.active = true;
				callContactCallback = function() {
					scenarii.level4Phase6();
					callContactCallback = null;
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					$scope.callContact($scope.$storage.contacts[0]);
				}
			});

			doSteps();
		};

		scenarii.level4Phase6 = function() {
			$log.debug(">scenario4Phase6");
			steps = [];

			$scope.tooltip.active = false;

			addChat(chatDelay, 'other', "Vous voyez : votre nouveau contact est formel : cette info n’est pas un scoop. Et en plus elle n’est pas crédible !");
			addChat(chatDelay, 'me', "D’accord. Mais si je voulais la publier...");
			addChat(chatDelay, 'other', "Tu n’aurais qu’à cliquer sur le bouton « publier », en dessous du cuitt, et à choisir l’emplacement que tu veux dans la maquette.");
			addChat(chatDelay, 'other', "Mais si vous publiez une info peu crédible, qui EN PLUS n’est pas un scoop... vous êtes VIRÉ !");
			addChat(chatDelay, 'other', "Ah, et si vous vous avisez de vous moquer de mon chat Grumphy en fond d'écran, VOUS ETES VIRE AUSSI !");
			addChat(chatDelay, 'me', "Ah...");
			addChat(chatDelay, 'other', "Et n’oubliez pas : il faut remplir les 6 emplacements de la maquette, si possible avec des infos qui concernent les 6 thématiques différentes !");
			addChat(chatDelay, 'other', "Bon allez, je vous laisse, j’arrive à l’aéroport. A moi les plages de sable fin et les cocktails ! Youhou !!!");
			addChat(chatDelay, 'me', "Mais attendez, je...");
			addChat(chatDelay, 'other', "déconnexion");
			addChat(chatDelay, 'me', "Ah. On dirait bien que je vais devoir me débrouiller seul(e) !");
			addStep(2500, function() {
				$scope.closeWin('chat');
				addCuit(true);
				endTuto();
			});
			doSteps();
		};

		scenarii.level4End = function() {
			$log.debug(">level4End");
			showScoring();
		};

		// Fake scenarii

		function fake() {
			if (fakes['level' + $scope.level]) {
				fakes['level' + $scope.level]();
			}
		}

		var fakes = {};

		// Level 2
		fakes.level2 = function() {
			$log.debug("fakes.level2");
			$scope.openWin('cuicuiter');
			$scope.openWin('blog');
			for (var i = 0; i < 6; i++) {
				addCuit();
			}
			steps = [];
			// publish 6 cuits
			i = 20; //2 + Math.round(Math.random() * 3);
			var max = 40;
			while (i && max) {
				$log.debug("fakes", i, max);
				addCuit(false, true);
				var cuit = Math.floor(Math.random() * Object.keys($scope.cuits).length);
				if (!$scope.cuits[cuit].published) {
					$scope.publishCuit($scope.cuits[cuit], true);
					i--;
				}
				max = max - 1;
			}
			doSteps();
			// showScoring();
		};
		// Level 3
		fakes.level3 = function() {
			$log.debug("fakes.level3");
			$scope.openWin('cuicuiter');
			$scope.openWin('blog');
			for (var i = 0; i < 6; i++) {
				addCuit();
			}
			steps = [];
			// publish 6 cuits
			i = 6; //2 + Math.round(Math.random() * 3);
			var max = 10;
			while (i && max) {
				addCuit(false, true);
				var cuit = Math.floor(Math.random() * Object.keys($scope.cuits).length);
				if (!$scope.cuits[cuit].published) {
					$scope.publishCuit($scope.cuits[cuit], true);
					i--;
				}
				max--;
			}
			doSteps();
			showScoring();
		};
		// Level 4
		fakes.level4 = function() {
			$log.debug("fakes.level4");

			$scope.score = 2000;

			$scope.openWin('cuicuiter');
			$scope.openWin('publish');

			for (var i = 0; i < 6; i++) {
				addCuit();
			}
			steps = [];
			// publish 6 cuits
			i = 6; //2 + Math.round(Math.random() * 3);
			var max = 10;
			while (i && max) {
				addCuit(false, true);
				var cuit = Math.floor(Math.random() * Object.keys($scope.cuits).length);
				if (!$scope.cuits[cuit].published) {
					$scope.publishCuit($scope.cuits[cuit], true);
					i--;
				}
				max--;
			}
			addStep(1500, function() {
				var post = utils.shuffle(jQuery('.grid-block__item'))[0];
				jQuery(post).find('.down').click();
			});
			doSteps();
			showScoring();
		};

		// Play level ( skip tuto)

		function play() {
			if (plays['level' + $scope.level]) {
				plays['level' + $scope.level]();
			}
		}

		var plays = {};

		// Level 2
		plays.level2 = function() {
			$log.debug("plays.level2");
			$scope.openWin('cuicuiter');
			$scope.openWin('blog');

			var themedSources = [];
			var otherSources = [];

			angular.forEach(dataService.data.all.sources, function(source, key) {
				if (source.themes.indexOf($scope.$storage.chosenTheme) > -1 && themedSources.length < 5) {
					themedSources.push(key);
				}
				if (source.themes.indexOf($scope.$storage.chosenTheme) === -1 && otherSources.length < 5) {
					otherSources.push(key);
				}
			});

			addCuit(true, null, null, null, themedSources.concat(otherSources));
		};
		// Level 3
		plays.level3 = function() {
			$log.debug("plays.level3");

			$scope.openWin('cuicuiter');
			$scope.openWin('skoupe');

			$scope.$storage.contacts = []; //dataService.data.all.contacts;
			$scope.$storage.allContacts = []; //dataService.data.all.contacts;

			if ($scope.$storage.savedContacts) {
				$scope.$storage.contacts = $scope.$storage.savedContacts;
				$scope.$storage.allContacts = $scope.$storage.savedAllContacts;
			} else {
				addContact();
				addContact($scope.$storage.chosenTheme);
				addContact($scope.$storage.mandatoryTheme);
				$scope.$storage.savedContacts = $scope.$storage.contacts;
				$scope.$storage.savedAllContacts = $scope.$storage.allContacts;
			}

			$log.debug($scope.$storage.contacts);

			$scope.openWin('blog');

			var chosenThemedSources = [];
			var mandatoryThemedSources = [];
			var otherSources = [];

			angular.forEach(dataService.data.all.sources, function(source, key) {
				if (source.themes.indexOf($scope.$storage.chosenTheme) > -1 && chosenThemedSources.length < 5) {
					chosenThemedSources.push(key);
				}
				if (source.themes.indexOf($scope.$storage.mandatoryTheme) > -1 && mandatoryThemedSources.length < 5) {
					mandatoryThemedSources.push(key);
				}
				if (source.themes.indexOf($scope.$storage.chosenTheme) === -1 && otherSources.length < 8) {
					otherSources.push(key);
				}
			});

			$log.debug(chosenThemedSources.concat(mandatoryThemedSources).concat(otherSources));
			$log.debug((chosenThemedSources.concat(mandatoryThemedSources).concat(otherSources)).length);

			addCuit(true, null, null, null, chosenThemedSources.concat(mandatoryThemedSources).concat(otherSources));
		};

		// Level 4
		plays.level4 = function() {
			$log.debug("plays.level3");
			$scope.openWin('cuicuiter');
			$scope.openWin('skoupe');

			// addContact();
			// addContact($scope.$storage.chosenTheme);
			// addContact($scope.$storage.mandatoryTheme);

			$scope.openWin('publish');
			addCuit(true);
		};

		// Publish Cuit

		$scope.posts = [];
		$scope.publishCuit = function(cuit, force) {
			if (cuit.published) {
				return;
			}
			if (!checkRemainingTime('publish-cuit')) {
				return;
			}
			if (false && $scope.posts.length === 5) {
				$scope.tooltip.content = "vous avez déjà publié 5 articles aujourd'hui";
				$scope.tooltip.position(jQuery('#blog'), 0, 100);
				$scope.tooltip.active = true;
				$timeout(function() {
					$scope.tooltip.active = false;
				}, 2000);
			} else {

				if (force) {
					doPublishCuit(cuit, true);
				} else {
					promptCallback = function() {
						doPublishCuit(cuit);
					};

					$scope.promptContent = "Êtes-vous sûr de vouloir publier ce Cuit ?";
					$scope.openWin('prompt');

				}
			}

		};

		function doPublishCuit(cuit) {
			$log.debug("publishCuit(", cuit);

			var post = {
				cuit: cuit,
				title: cuit.articleTitle,
				date: Math.floor(($scope.totalTime - $scope.remainingTime) / $scope.remainingTime * 10 * 60) + (8 * 60)
			};
			angular.forEach($scope.cuits, function(c, idx) {
				if (c.id === cuit.id) {
					$scope.cuits[idx].published = true;
				}
			});
			$scope.posts.push(post);

			if ($scope.level === 4) {
				$scope.openWin('publish');
			} else {
				$scope.openWin('blog');
			}

			decrementTime("publish-cuit", 'publish');

			updateFeedback(post);

			updateScore();

			$scope.tooltip.active = false;

			$scope.closeWin('prompt');
			promptCallback = null;
		}

		$scope.unpublish = function(post) {
			$scope.currentPost = post;

			if (!checkRemainingTime('unpublish-cuit')) {
				return;
			}

			promptCallback = function() {

				$log.debug("unpublish(", $scope.currentPost.cuit.id);

				angular.forEach($scope.cuits, function(c, idx) {
					if (c.id === post.cuit.id) {
						$scope.cuits[idx].published = false;
					}
				});

				angular.forEach($scope.posts, function(p, idx) {
					if (p.cuit.id === $scope.currentPost.cuit.id) {
						$scope.posts.splice(idx, 1);
						decrementTime("unpublish-cuit", 'publish');

						updateScore();

					}
				});

				$scope.closeWin('prompt');
				promptCallback = null;
			};

			$scope.promptContent = "Êtes-vous sûr de vouloir dépublier cet article ?";
			$scope.openWin('prompt');

			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#prompt .confirm').click();
				}
			});
		};

		$scope.publishDown = function(pos) {
			$log.debug("publishDown(", pos);
			if (pos < $scope.posts.length - 1) {
				var tmp = $scope.posts[pos + 1];
				$scope.posts[pos + 1] = $scope.posts[pos];
				$scope.posts[pos] = tmp;
				updateScore();
			}
		};

		$scope.publishUp = function(pos) {
			$log.debug("publishUp(", pos);
			var tmp = $scope.posts[pos - 1];
			$scope.posts[pos - 1] = $scope.posts[pos];
			$scope.posts[pos] = tmp;
			updateScore();
		};

		$scope.feedback = {
			status: null,
			active: false,
			type: null
		};

		function updateFeedback(post) {
			if ($scope.level === 2) {
				if (post.cuit.theme === $scope.$storage.chosenTheme) {
					feedback('good', dataService.data.settings.messages['level-2']['feedback-good-theme']);
				} else {
					feedback('bad', dataService.data.settings.messages['level-2']['feedback-wrong-theme']);
				}
			}
			if ($scope.level === 3) {
				$log.debug([$scope.$storage.chosenTheme, $scope.$storage.mandatoryTheme], post.cuit.theme);
				if ([$scope.$storage.chosenTheme, $scope.$storage.mandatoryTheme].indexOf(post.cuit.theme) !== -1) {
					if (post.cuit.credibility > 1) {
						feedback('good', dataService.data.settings.messages['level-3']['feedback-good-theme']);
					} else {
						feedback('bad', dataService.data.settings.messages['level-3']['feedback-bad-credibility']);

					}
				} else {
					feedback('bad', dataService.data.settings.messages['level-3']['feedback-wrong-theme']);
				}
			}
		}

		function feedback(type, detail) {
			$log.debug("feedback(", type, detail);
			$scope.feedback.type = type;
			if (type === "good") {
				Sound.play('feedbackGood');
				$scope.feedback.status = "Vos lecteurs vont aimer cette publication !";
			}
			if (type === "bad") {
				Sound.play('feedbackBad');
				$scope.feedback.status = "Vos lecteurs ne vont aimer pas cette publication !";
			}
			$scope.feedback.detail = detail;
			$scope.feedback.active = true;
			$timeout(function() {
				$scope.feedback.active = false;
			}, 4000);
		}

		$scope.endDay = function() {

			promptCallback = function() {

				$log.debug("endDay");

				$scope.closeWin('prompt');
				promptCallback = null;

				doEndDay();
			};

			$scope.promptContent = "Êtes-vous sûrs de vouloir terminer votre journée ?";
			$scope.openWin('prompt');

		};

		function doEndDay() {
			$scope.skipCuits = true;
			scenarii['level' + $scope.level + 'End']();
		}

		function showScoring() {
			updateScore();
			$rootScope.posts = $scope.posts;
			$rootScope.scoreStatus = $scope.scoreStatus;
			$location.path('/outro');
		}

		function updateScore() {
			var score = $scope.score ? $scope.score : 0;
			var scoring = $scope.scoring['level-' + $scope.level];
			if ($scope.level === 1) {
				$scope.scoreStatus = 'victory';
			}
			if ($scope.level === 2) {
				angular.forEach($scope.posts, function(post, idx) {
					if (post.cuit.theme === $scope.$storage.chosenTheme) {
						score += scoring['select-cuit-in-correct-theme'];
						$scope.posts[idx].score = scoring['select-cuit-in-correct-theme'];
					} else {
						score += scoring['select-cuit-in-wrong-theme'];
						$scope.posts[idx].score = scoring['select-cuit-in-wrong-theme'];
					}
				});
			}
			if ($scope.level === 3) {
				angular.forEach($scope.posts, function(post, idx) {
					if ([$scope.$storage.chosenTheme, $scope.$storage.mandatoryTheme].indexOf(post.cuit.theme) === -1) {
						score += scoring['select-cuit-in-wrong-theme'];
						$scope.posts[idx].score = scoring['select-cuit-in-wrong-theme'];
					} else {
						score += scoring['select-cuit-in-correct-theme-credibility-' + post.cuit.credibility];
						$scope.posts[idx].score = scoring['select-cuit-in-correct-theme-credibility-' + post.cuit.credibility];
					}
				});
			}
			if ($scope.level === 4) {
				var base, multiplier, cuitScore, themes = [];
				angular.forEach($scope.posts, function(post, idx) {
					$log.debug(idx, post.cuit.id, post.cuit.credibility, post.cuit.scoop);

					base = 'select-cuit-credibility-' + post.cuit.credibility;
					if (post.cuit.credibility > 0) {
						base = base + (post.cuit.scoop ? '-exclusive' : '-not-exclusive');
					}
					multiplier = scoring['cuit-position'][idx];
					cuitScore = scoring[base] * multiplier;
					score += cuitScore;

					if (themes.indexOf(post.cuit.theme) === -1) {
						themes.push(post.cuit.theme);
					}

					$log.debug(base, multiplier, cuitScore);

					$scope.posts[idx].score = cuitScore;
				});
				$log.debug(themes);
				score = score * themes.length;
			}
			$log.debug("score : " + score);

			if (scoring) {
				if (score === 0) {
					$scope.scoreStatus = 'defeat';
				} else {
					$scope.scoreStatus = score >= $scope.scoring['level-' + $scope.level]['winning-score'] ? 'victory' : 'defeat';
				}
			} else {
				$scope.scoreStatus = 'victory';
			}
			$scope.$storage.scores['level-' + $scope.level] = score;
			$scope.$storage.posts = $scope.posts;
			$scope.$storage.scoreStatus = $scope.scoreStatus;

			$scope.scoreLevel = 'green';
			if ($scope.scoring['level-' + $scope.level]) {
				if ($scope.scoring['level-' + $scope.level]['winning-score'] / score <= 0.15) {
					$scope.scoreLevel = 'lightgreen';
				}
				if ($scope.scoring['level-' + $scope.level]['winning-score'] / score <= 0.25) {
					$scope.scoreLevel = 'yellow';
				}
				if ($scope.scoring['level-' + $scope.level]['winning-score'] / score <= 0.5) {
					$scope.scoreLevel = 'orange';
				}
				if ($scope.scoring['level-' + $scope.level]['winning-score'] / score <= 0.75) {
					$scope.scoreLevel = 'red';
				}
			}

			$log.debug($scope.scoreLevel);

		}

		/*
		App is ready to go
		*/

		$timeout(function() {
			$log.debug($scope.fake);
			$log.debug($scope.chosenTheme);
			updateScore();
			if ($scope.fake) {
				fake();
			} else {
				if ($scope.skip) {
					play();
				} else {
					scenario();
				}
			}
		}, 500);

	});