'use strict';

angular.module('newsGameApp')
	.controller('PlayCtrl', function($document, $rootScope, $scope, $routeParams, $location, ipCookie, $log, prod, $timeout, $interval, dataService, titleService, utils) {

		$scope.debug = ($routeParams.debug);

		titleService.setTitle('Play');

		// debug config
		var delayModifier = ($scope.debug ? 0.05 : 1);

		var chatDelay = dataService.data.settings.chatDelay;

		// reference to all windows on the desktop
		$scope.windows = {};

		// current difficulty level
		$scope.level = ipCookie('level') ? parseInt(ipCookie('level'), 10) : 1;
		ipCookie('level', $scope.level, {
			expires: 365
		});

		// Scoring
		$scope.scoring = dataService.data.settings.scoring;

		// TotalTime ( and RemainingTime ) are loaded from /data/settings.json
		$scope.totalTime = $scope.remainingTime = dataService.data.settings.totalTime['level-' + $scope.level];

		// all themes are loaded from /data/all.json
		$scope.themes = dataService.data.all.themes;

		// selected theme
		$scope.currentTheme = ipCookie('theme') ? ipCookie('theme') : $scope.currentTheme;
		$scope.mandatory = ipCookie('mandatory') ? ipCookie('mandatory') : $scope.mandatory;

		$scope.actionsCost = dataService.data.settings.actionsCost;

		$scope.showScoring = false;

		$rootScope.background = 'play-level-' + $scope.level;

		/*
		CuitCuiter
		*/

		// currently displayed cuits
		$scope.allCuits = [];
		$scope.cuits = [];

		// open Cuit source window
		var openSourceThemeCallback = false;
		$scope.openSource = function(id) {
			// $log.log("openSource(" + id);
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
			// $log.log("verifySourceTheme(" + id);
			dataService.data.all.sources[id].themeVerified = true;
			$scope.currentSource = dataService.data.all.sources[id];
			decrementTime('verify-source-theme');
			applySourceTheme();
			if (verifySourceThemeCallback) {
				verifySourceThemeCallback();
			}
		};

		function applySourceTheme() {
			angular.forEach($scope.cuits, function(cuit, id) {
				$scope.cuits[id].author = dataService.data.all.sources[cuit.source];
				$scope.cuits[id].themeVerified = true;
			});
		}

		// add cuit to Cuicuiter timeline

		$scope.cuitsHover = false;
		$scope.cuitsOver = function() {
			$scope.cuitsHover = true;
		};
		$scope.cuitsOut = function() {
			$scope.cuitsHover = false;
		};

		function addCuit(next, force, author, theme) {
			// $log.log("addCuit", next, force, author, theme);
			if (!force && ($scope.cuitsHover || $scope.skipCuits)) {
				$timeout(function() {
					addCuit(true);
				}, (Math.random() * chatDelay * delayModifier) + 800);
			} else {
				var added = false;
				// iterate through all cuits ( loaded from /data/all.json )
				var cuits = utils.shuffle(Object.keys(dataService.data.all.cuits));
				angular.forEach(cuits, function(cuitIdx) {
					var cuit = dataService.data.all.cuits[cuitIdx];

					// if cuit is not currenlty displayed
					if (!added && $scope.allCuits.indexOf(cuitIdx) === -1) {
						if ((!author && !theme) || cuit.source === author || cuit.theme === theme) {
							cuit.author = dataService.data.all.sources[cuit.source];
							if (cuit.author) {
								cuit.themeVerified = cuit.author.themeVerified;
							}
							$scope.allCuits.push(cuitIdx);
							$scope.cuits.unshift(cuit);
							$timeout(function() {
								cuit.visible = true;
							}, 1);
							added = true;
							// scheduled next cuit
							if (next) {
								$timeout(function() {
									addCuit(true);
								}, (Math.random() * chatDelay * delayModifier) + 800);
							}
						}
					}
				});
			}
		}

		// Verify Cuit Theme ( + decrement time counter )
		var verifyCuitThemeCallback = false;
		$scope.verifyCuitTheme = function(cuit) {
			// $log.log("verifyCuitTheme(" + cuit);
			$scope.currentCuit = cuit;
			cuit.themeVerified = true;
			decrementTime('verify-cuit-theme');
			if (verifyCuitThemeCallback) {
				selectedCuit = cuit;
				verifyCuitThemeCallback();
			}
		};

		// Verify Cuit Credibility ( + decrement time counter )
		var verifyCuitCredibilityCallback = false;
		$scope.verifyCuitCredibility = function(cuit) {
			// $log.log("verifyCuitCredibility(" + cuit);
			if (verifyCuitCredibilityCallback) {
				selectedCuit = cuit;
				$scope.canCall = true;
				verifyCuitCredibilityCallback();
			}
		};

		function updateCuitCredibility() {
			$log.log(selectedCuit);
			$log.log(selectedContact);
			if (selectedContact.themes.indexOf(selectedCuit.theme) === -1) {
				selectedCuit.credibilityVerified = true;
			}
		}

		/*
		Skoupe
		*/

		// all contacts are loaded from /data/all.json
		$scope.contacts = []; //dataService.data.all.contacts;
		$scope.allContacts = [];

		// current contact displayed in contact detail window
		$scope.currentContact = null;

		function addContact(theme) {
			$log.log("addContact(", theme);
			var contacts = utils.shuffle(Object.keys(dataService.data.all.contacts));
			var added = false;
			angular.forEach(contacts, function(contactIdx) {
				var contact = dataService.data.all.contacts[contactIdx];
				if (!added && $scope.allContacts.indexOf(contactIdx) === -1) {
					if ((!theme) || contact.themes.indexOf(theme) !== -1) {
						$scope.allContacts.push(contactIdx);
						$scope.contacts.unshift(contact);
						added = true;
					}
				}
			});
		}

		// open contact detail window
		$scope.openContact = function(id) {
			// $log.log("openContact(" + id);
			$scope.closeWin('contact');
			$scope.currentContact = $scope.contacts[id];
			$scope.openWin('contact');
		};

		var callContactCallback;
		var selectedContact;
		$scope.canCall = false;
		$scope.callContact = function(contact) {
			$log.log("callContact(", contact.id);
			if (callContactCallback) {
				decrementTime('verify-cuit-credibility');
				selectedContact = contact;
				updateCuitCredibility();
				callContactCallback();
			}
		};

		// current chat displayed in chat window
		$scope.currentChat = null;

		// open chat window
		$scope.openChat = function(id) {
			// $log.log("openChat(" + id);
			$scope.closeWin('chat');
			$scope.currentchatContact = $scope.chat[id];
			$scope.openWin('chat');
		};

		/*
		Timeline
		*/

		// decrement remaining time

		$scope.gaugeLevel = 'green';

		function decrementTime(type) {
			// the cost of each actions are specified in /data/settings.json
			var value = dataService.data.settings.actionsCost[type];
			// $log.log("decrementTime : " + value + " (" + type + ")");
			$scope.remainingTime -= value;
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
			position: function($elt, top, left) {
				jQuery('#tooltip').css({
					top: $elt.offset().top + top,
					left: $elt.offset().left + left
				});
			}
		};

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
			visible: false,
			template: 'cuicuiter-main',
			height: 505,
			position: {
				top: 25,
				left: 20
			}
		});
		createWindow('source', {
			title: 'Source',
			active: false,
			template: 'cuicuiter-source',
			width: 400,
			height: 225,
			position: {
				top: 125,
				left: 250
			}
		});

		createWindow('skoupe', {
			title: 'Skoupe',
			visible: false,
			active: false,
			template: 'skoupe-main',
			height: 150,
			position: {
				top: 50,
				left: 600
			}
		});

		createWindow('contact', {
			title: 'Contact',
			active: false,
			visible: false,
			template: 'skoupe-contact',
			position: {
				top: 125,
				left: 550
			}
		});

		createWindow('chat', {
			title: 'Conversation',
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
			height: 200,
			position: {
				top: 250,
				left: 450
			}
		});

		createWindow('themeSelector', {
			title: "Choix d'une thématique",
			template: 'theme-selector',
			active: false,
			actions: [],
			modal: true,
			height: 280,
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

		createWindow('blog', {
			title: 'Mon blog ::: Publier',
			active: true,
			template: 'blog',
			height: 360,
			width: 285,
			position: {
				top: 250,
				left: 550
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
				var $container = angular.element(document.getElementById('chat-scroll'));
				var chatBottom = angular.element(document.getElementById('chat-bottom'));
				$container.scrollToElement(chatBottom, 30, 100);
			});
			addStep(delay - 500, function() {
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

			steps = [];

			addStep(500, function() {
				$scope.openWin('cuicuiter');
			});

			addStep(chatDelay, function() {
				$scope.openWin('chat');
			});

			addChat(chatDelay, 'other', "Alors, tu as lancé Cuicuitter ?");
			addChat(chatDelay, 'me', "Oui, je viens de le faire, mais je comprends rien... C’est quoi tous ces messages ?");

			addChat(chatDelay, 'other', "Ca s’appelle des « Cuitts » ! C’est des messages très courts. Ils viennent s’afficher dans ta timeline dès que quelqu’un les poste.");
			addChat(chatDelay, 'me', "Mais justement, qui les poste ?");
			addChat(chatDelay, 'other', "Tout le monde ! Des stars, des sportifs, des pros de l’économie ou de la politique... Y en a pour tous les goûts ! En gros, il y a six grandes thématiques. Attends, je t’envoie la liste...");

			addStep(500, function() {
				$scope.openWin('notepad');
			});

			addChat(chatDelay, 'me', "Ah merci ! Mais... tout ne m’intéresse pas, là-dedans. Tu sais que moi, ma passion, c’est...");

			addStep(500, function() {
				$scope.closeWin('notepad');
				$scope.openWin('themeSelector');
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					var $choices = jQuery('#themeSelector :radio');
					$choices.eq(Math.round(Math.random() * $choices.length)).click();
					jQuery('#themeSelector button').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase2 = function() {

			$scope.closeWin('themeSelector');

			$scope.currentTheme = jQuery('#themeSelector :checked').val();

			$log.log(">level1Phase2 : " + $scope.currentTheme);

			ipCookie('theme', $scope.currentTheme, {
				expires: 365
			});

			steps = [];

			addChat(500, 'me', $scope.themes[$scope.currentTheme] + "! Si je veux trouver des infos sur ce sujet-là, je fais comment ?");
			addChat(chatDelay, 'other', "Tu ouvres grands tes yeux... et tu fais marcher ton cerveau ! En lisant les Cuitts, tu pourras déterminer de quoi ils parlent.");

			addChat(chatDelay, 'me', "Hum... pas facile !");
			addChat(chatDelay, 'other', "Je vois. Si tu as un doute, tu peux faire une recherche pour vérifier la thématique de chaque Cuitt. Regarde : choisis-en un, n’importe lequel !");

			addStep(chatDelay, function() {
				// show info popup
				$scope.skipCuits = true;
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 0, 100);
				$scope.tooltip.active = true;
				verifyCuitThemeCallback = function() {
					scenarii.level1Phase3();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.theme button').click();
				}
			});

			doSteps();

		};
		$scope.level1Phase2 = scenarii.level1Phase2;

		var selectedCuit;
		scenarii.level1Phase3 = function() {

			// $scope.skipCuits = false;
			$scope.tooltip.active = false;
			verifyCuitThemeCallback = false;

			$log.log(">level1Phase3");

			steps = [];

			addChat(chatDelay, 'other', "Et voilà ! Tu vois, ça a pris un peu de temps mais ça en valait la peine ! Maintenant, tu sais que ce cuitt parle de " + selectedCuit.theme + ".");
			addChat(chatDelay, 'other', "Tu vois, c’est signalé par le petit picto qui a remplacé le point d’interrogation en dessous du message !");

			if (selectedCuit.theme === $scope.currentTheme) {
				addChat(chatDelay, 'me', "Ah, géniale, cette info ! justement ce qui m’intéresse !");
			} else {
				addChat(chatDelay, 'me', "Ah ouais... Pas mal, cette info, mais, moi, ce qui m’intéresse, c’est " + $scope.themes[$scope.currentTheme] + ".");
			}
			addChat(chatDelay, 'other', "Ce qui est cool avec Cuicuitter, c’est que je suis sûr qu’en fouillant dans la timeline, tu peux trouver un autre cuit qui parle de " + $scope.themes[$scope.currentTheme] + ". A toi de jouer !");

			addStep(chatDelay, function() {
				// show info popup
				addCuit(false, true);
				$scope.skipCuits = true;
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 0, 100);
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

			$log.log(">level1Phase4");

			steps = [];

			$log.log(selectedCuit.theme, " === ", $scope.currentTheme);
			if (selectedCuit.theme === $scope.currentTheme) {
				scenarii.level1Phase5();
				return;
			} else {
				verifyCuitThemeCallback = function() {
					scenarii.level1Phase4();
				};

				addChat(chatDelay, 'me', "Ah... ce Cuitt-là ne m’intéresse pas trop. Attends, j’en cherche un autre !");
				addStep(chatDelay, function() {
					// show info popup
					addCuit(false, true);
					/*
					var nbCuits = Math.round(Math.random() * 3);
					while (nbCuits--) {
						$timeout(function() {
							addCuit(false, true);
						}, Math.round(500 + Math.random() * 500));
					}
					*/
					$scope.skipCuits = true;
					$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
					$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 0, 100);
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

			$log.log(">level1Phase5");

			steps = [];

			addChat(chatDelay, 'me', "Ouah, génial ! C’est super intéressant ce truc !.");
			addChat(chatDelay, 'other', "T’as vu ? J’apprends plein d’infos de première fraîcheur depuis que je m’en sers... ");
			addChat(chatDelay, 'other', "Bon, il y a aussi des trucs un peu bidon, mais en général, quand tu vérifies qui poste, tu peux savoir si c’est du solide ou pas...");
			addChat(chatDelay, 'me', "Ah ? Comment on fait ça ?");
			addChat(chatDelay, 'other', "Ben, pour voir la fiche de quelqu’un, il faut cliquer sur sa photo d’avatar ou sur son nom d’utilisateur.");
			addStep(chatDelay, function() {
				addCuit(false, true);
				addCuit(false, true, null, $scope.currentTheme);
				addCuit(false, true);
			});
			addChat(chatDelay, 'other', "Regarde, tu vois le gars qui vient de poster trois messages ? Tu peux cliquer sur sa photo...");
			addStep(chatDelay, function() {
				// add new cuits
				$scope.skipCuits = true;
				var authors = Object.keys(dataService.data.all.sources);
				var author = authors[Math.round(Math.random() * authors.length)];
				addCuit(false, true, author);
				addCuit(false, true, author);
				addCuit(false, true, author);
				// show info popup
				$scope.tooltip.content = "Cliquez sur le profil de l'auteur";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.source'), 0, 100);
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

			$log.log(">level1Phase6");

			steps = [];

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Analyser la source</strong>";
				$scope.tooltip.position(jQuery('#source .metas .theme button'), 0, 100);
				$scope.tooltip.active = true;
				verifySourceThemeCallback = function() {
					scenarii.level1Phase7();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					jQuery('#source .metas .theme button').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase7 = function() {

			$scope.tooltip.active = false;
			verifySourceThemeCallback = false;

			$log.log(">level1Phase7");

			steps = [];

			addChat(chatDelay, 'me', "Ouah, trop cool !");
			addChat(chatDelay, 'other', "T’as vu ? Analyser une source, ça prend du temps, mais après tu connais la thématique de chacun de ses Cuitts !");
			addChat(chatDelay, 'me', "C’est génial, Cuicuitter ! Ca doit être un super outil pour les journalistes, ça !");
			addChat(chatDelay, 'other', "Carrément !");
			addChat(chatDelay, 'me', "Tiens, mais d’ailleurs... Journaliste... Voilà un métier qui me plairait à fond !");

			addChat(chatDelay, 'other', "Ah ouais ? Cool ! Ben voilà, plus besoin de te prendre la tête, tu sais quoi mettre sur ta fiche d’orientation ! Mais tu vas devoir apprendre à maîtriser Cuicuitter à mort, alors !");

			addStep(2500, function() {
				// show scoring
				showScoring();
			});

			doSteps();

		};

		// Level 2
		scenarii.level2 = function() {
			$log.log(">scenario2");

			$scope.currentChat = {
				contact: "Medhi",
				discussion: []
			};

			$scope.currentTheme = ipCookie('theme');

			steps = [];

			addStep(500, function() {
				$scope.openWin('cuicuiter');
			});

			addStep(chatDelay, function() {
				$scope.openWin('chat');
			});

			addChat(chatDelay, 'other', "Salut !");
			addChat(chatDelay, 'me', "Salut ! Ca roule ?");
			addChat(chatDelay, 'other', "Bien, et toi ? Alors, tu révises le concours pour les écoles de journalisme ?");
			addChat(chatDelay, 'me', "Pfff... M’en parle pas, c’est crevant x_x. En plus, j’ai ouvert un blog pour m’entrainer à écrire des articles...");
			addChat(chatDelay, 'other', "Ah bon ? Un blog ? Cool ! Sur quel sujet ?");
			addChat(chatDelay, 'me', "Sur " + $scope.themes[$scope.currentTheme] + ".");
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
				$scope.tooltip.content = "Choisissez des infos dans votre fil Cuicuitter et publiez-les sur votre blog. Attention : choisissez-les bien dans la thématique " + $scope.themes[$scope.currentTheme] + ". Et faites attention : le temps passe vite ! ";
				$scope.tooltip.position(jQuery('#cuicuiter'), 0, 100);
				$scope.tooltip.active = true;
				$scope.openWin('blog');
			});

			addStep(500, function() {
				// $scope.tooltip.active = false;
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					var i = 6; //2 + Math.round(Math.random() * 3);
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
					scenarii.level2End();
				}
			});

			doSteps();

		};

		scenarii.level2End = function() {
			$log.log(">level2End");
			showScoring();
		};

		// Level 3
		scenarii.level3 = function() {
			$log.log(">scenario3");

			$scope.skipCuits = true;

			$scope.currentChat = {
				contact: "Jessica",
				discussion: []
			};

			$scope.currentTheme = ipCookie('theme');
			$scope.mandatoryTheme = ipCookie('mandatory');

			steps = [];

			addStep(500, function() {
				$scope.openWin('cuicuiter');
			});

			addStep(chatDelay, function() {
				$scope.openWin('chat');
			});

			addChat(chatDelay, 'other', "Vous êtes connecté(e) ?");
			addChat(chatDelay, 'me', "Oui, ça y est !");
			addChat(chatDelay, 'other', "Alors je vais vous montrer comment vérifier une info. Commencez par vérifier la thématique d'un cuit.");

			addStep(chatDelay, function() {
				addCuit(false, true, null, $scope.currentTheme);
				addCuit(false, true, null, $scope.currentTheme);
				// show info popup
				$scope.skipCuits = true;
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 0, 100);
				$scope.tooltip.active = true;
				verifyCuitThemeCallback = function() {
					scenarii.level3Phase2();
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
			$log.log(">scenario3Phase2");
			steps = [];
			addChat(chatDelay, 'other', "Très bien ! Vous avez vu, ça parle de " + $scope.themes[selectedCuit.theme] + "... Ca pourrait intéresser nos lecteurs ! Mais il faut vérifier que l’info est bien crédible. C’est à ça que sert le nouveau bouton qui vient d’apparaître. Cliquez dessus.");

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la crédibilité</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-credibility").first().find('.metas .credibility button'), 0, 100);
				$scope.tooltip.active = true;
				verifyCuitCredibilityCallback = function() {
					scenarii.level3Phase3();
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
			$log.log(">scenario3Phase3");
			steps = [];

			addStep(500, function() {
				$scope.openWin('skoupe');
				addContact();
				addContact(selectedCuit.theme);
				addContact();
			});

			addChat(chatDelay, 'other', "Pour vérifier une info, vous devez contacter quelqu’un en qui vous avez confiance. J’ai rajouté trois personnes dans votre carnet d’adresses. Mais attention ! Il faut que vous choisissiez un contact qui s’y connaît dans la thématique " + $scope.themes[$scope.mandatory] + ". A vous de jouer !");

			addStep(chatDelay, function() {
				// show info popup
				$scope.tooltip.content = "Choisissez un contact";
				$scope.tooltip.position(jQuery('#skoupe .inner'), 0, 100);
				$scope.tooltip.active = true;
				callContactCallback = function() {
					scenarii.level3Phase4();
				};
			});

			addStep(chatDelay, function() {
				if ($scope.debug) {
					var contact = utils.shuffle($scope.contacts)[0];
					$scope.callContact(contact);
				}
			});

			doSteps();
		};

		scenarii.level3Phase4 = function() {
			$log.log(">scenario3Phase4");
			steps = [];

			if (selectedContact.themes.indexOf(selectedCuit.theme) === -1) {
				addChat(chatDelay, 'other', "Eh non ! Ce contact n’est pas spécialiste de " + $scope.themes[selectedCuit.theme] + ". Regardez bien les petites icônes dans la colonne « Thématique » de votre carnet d’adresses. Allez, choisissez un autre contact !");
				addStep(chatDelay, function() {
					// show info popup
					$scope.tooltip.content = "Choisissez un contact";
					$scope.tooltip.position(jQuery('#skoupe .inner'), 0, 100);
					$scope.tooltip.active = true;
					callContactCallback = function() {
						scenarii.level3Phase4();
					};
				});
				addStep(chatDelay, function() {
					if ($scope.debug) {
						var contact = utils.shuffle($scope.contacts)[0];
						$scope.callContact(contact);
					}
				});
			} else {
				$scope.canCall = false;
				$scope.tooltip.active = false;
				addChat(chatDelay, 'other', "Bravo ! Vous voyez, maintenant, vous connaissez la crédibilité de l’info. Il y a quatre niveaux possibles, de 0 étoiles pour une info pas crédible à trois étoiles pour une super info. A vous de décider si vous la publiez ou pas !");
				addChat(chatDelay, 'me', "Je vois... Et je peux demander à mes contacts d’évaluer la crédibilité d’une source ?");
				addChat(chatDelay, 'other', "Bien sûr ! En cliquant sur une photo d’avatar ou sur un nom dans le fil Cuicuitter, vous pourrez vérifier la crédibilité de n’importe qui. Mais il faudra d’abord analyser la source, pour savoir quelles sont ses thématiques préférées.");
				addChat(chatDelay, 'me', "Ah... Ca n’a pas l’air facile !");
				addChat(chatDelay, 'other', "Le mieux, c’est d’apprendre en faisant. Alors je vous laisse essayer. N’oubliez pas de publier des infos qui parlent de " + $scope.themes[$scope.currentTheme] + " ou de " + $scope.themes[$scope.mandatory] + ". Bonne journée !");
				addStep(2500, function() {
					$scope.closeWin('chat');
					$scope.openWin('blog');
				});
			}

			doSteps();
		};

		scenarii.level3End = function() {
			$log.log(">level3End");
			showScoring();
		};

		// Publish Cuit

		$scope.posts = [];
		$scope.publishCuit = function(cuit, force) {
			$scope.currentCuit = cuit;

			if (false && $scope.posts.length === 5) {
				$log.log("already 5 posts");
				$scope.tooltip.content = "vous avez déjà publié 5 articles aujourd'hui";
				$scope.tooltip.position(jQuery('#blog'), 0, 100);
				$scope.tooltip.active = true;
				$timeout(function() {
					$scope.tooltip.active = false;
				}, 2000);
			} else {

				if (force) {
					doPublishCuit($scope.currentCuit, true);
				} else {
					promptCallback = function() {
						doPublishCuit($scope.currentCuit);
					};

					$scope.promptContent = "Êtes-vous sûr de vouloir publier ce Cuit ?";
					$scope.openWin('prompt');

				}
			}

		};

		function doPublishCuit(cuit) {
			$log.log("publishCuit(", cuit);
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
			decrementTime("publish-cuit");

			updateFeedback(post);

			updateScore();

			$scope.tooltip.active = false;

			$scope.closeWin('prompt');
			promptCallback = null;
		}

		$scope.unpublish = function(post) {
			$scope.currentPost = post;

			promptCallback = function() {

				$log.log("unpublish(", $scope.currentPost.cuit.id);
				angular.forEach($scope.posts, function(p, idx) {
					if (p.cuit.id === $scope.currentPost.cuit.id) {
						$scope.posts.splice(idx, 1);
						decrementTime("unpublish-cuit");

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

		$scope.feedback = {
			status: null,
			active: false,
			type: null
		};

		function updateFeedback(post) {
			if ($scope.level === 2) {
				if (post.cuit.theme === $scope.currentTheme) {
					feedback('good', dataService.data.settings.messages['level-2']['feedback-good-theme']);
				} else {
					feedback('bad', dataService.data.settings.messages['level-2']['feedback-wrong-theme']);
				}
			}
		}

		function feedback(type, detail) {
			$log.log("feedback(", type, detail);
			$scope.feedback.type = type;
			if (type === "good") {
				$scope.feedback.status = "Vos lecteurs vont aimer cette publication !";
			}
			if (type === "bad") {
				$scope.feedback.status = "Vos lecteurs ne vont aimer pas cette publication !";
			}
			$scope.feedback.detail = detail;
			$scope.feedback.active = true;
			$log.log($scope.feedback);
			$timeout(function() {
				$scope.feedback.active = false;
			}, 2000);
		}

		$scope.endDay = function() {
			$scope.skipCuits = true;
			scenarii['level' + $scope.level + 'End']();
		};

		$scope.nextLevel = function() {
			ipCookie('level', parseInt($scope.level, 10) + 1, {
				expires: 365
			});
			$location.path('/intro');
		};

		$scope.playAgain = function() {
			$location.path('/play');
		};

		function showScoring() {
			updateScore();
			$scope.showScoring = true;
		}

		function updateScore() {
			var score = 0;
			var scoring = $scope.scoring['level-' + $scope.level];
			if ($scope.level === 2) {
				angular.forEach($scope.posts, function(post, idx) {
					$log.log(post.cuit.theme, '===', $scope.currentTheme);
					if (post.cuit.theme === $scope.currentTheme) {
						score += scoring['select-cuit-in-correct-theme'];
						$scope.posts[idx].score = scoring['select-cuit-in-correct-theme'];
					} else {
						score += scoring['select-cuit-in-wrong-theme'];
						$scope.posts[idx].score = scoring['select-cuit-in-wrong-theme'];
					}
				});
			}
			$log.log("score : " + score);
			var cookieScores = ipCookie('scores');
			if (!cookieScores) {
				cookieScores = {};
			}
			cookieScores['level-' + $scope.level] = score;
			ipCookie('scores', cookieScores, {
				expires: 21
			});
			$scope.scores = cookieScores;
			$log.log(scoring);
			$log.log($scope.scoring);
			if (scoring) {
				$scope.scoreStatus = score > $scope.scoring['level-' + $scope.level]['winning-score'] ? 'victory' : 'defeat';
			} else {
				$scope.scoreStatus = 'victory';
			}
			$log.log(cookieScores);
		}

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