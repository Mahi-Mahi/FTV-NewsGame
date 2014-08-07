'use strict';

angular.module('newsGameApp')
	.controller('PlayCtrl', function($document, $rootScope, $scope, $routeParams, $location, $cookies, $log, prod, $timeout, $interval, dataService, titleService, utils) {

		$scope.debug = ($routeParams.debug);

		titleService.setTitle('Play');

		// debug config
		var delayModifier = ($scope.debug ? 0.05 : 1);

		// reference to all windows on the desktop
		$scope.windows = {};

		// current difficulty level
		$scope.level = $cookies.level ? parseInt($cookies.level, 10) : 1;
		$cookies.level = $scope.level;

		// TotalTime ( and RemainingTime ) are loaded from /data/settings.json
		$scope.totalTime = $scope.remainingTime = dataService.data.settings.totalTime['level-' + $scope.level];

		// all themes are loaded from /data/all.json
		$scope.themes = dataService.data.all.themes;

		// selected theme
		$scope.currentTheme = null;

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

		function addCuit(next, force, author) {
			// $log.log("addCuit", next, force, author);
			if (!force && ($scope.cuitsHover || $scope.skipCuits)) {
				$timeout(function() {
					addCuit(true);
				}, (Math.random() * 1500 * delayModifier) + 800);
			} else {
				var added = false;
				// iterate through all cuits ( loaded from /data/all.json )
				var cuits = utils.shuffle(Object.keys(dataService.data.all.cuits));
				angular.forEach(cuits, function(cuitIdx) {
					var cuit = dataService.data.all.cuits[cuitIdx];
					// if cuit is not currenlty displayed
					if (!added && $scope.allCuits.indexOf(cuitIdx) === -1) {
						if (!author || cuit.source === author) {
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
								}, (Math.random() * 1500 * delayModifier) + 800);
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
			cuit.themeVerified = true;
			decrementTime('verify-cuit-theme');
			if (verifyCuitThemeCallback) {
				selectedCuit = cuit;
				verifyCuitThemeCallback();
			}
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
			// $log.log("openContact(" + id);
			$scope.closeWin('contact');
			$scope.currentContact = $scope.contacts[id];
			$scope.openWin('contact');
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

		function decrementTime(type) {
			// the cost of each actions are specified in /data/settings.json
			var value = dataService.data.settings.actionsCost[type];
			// $log.log("decrementTime : " + value + " (" + type + ")");
			$scope.remainingTime -= value;
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
			height: 200,
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
				top: 250,
				left: 250
			}
		});

		createWindow('blog', {
			title: 'blog',
			active: true,
			template: 'blog',
			height: 400,
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

			addStep(1500, function() {
				$scope.openWin('chat');
			});

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

			$log.log(">level1Phase2");

			$cookies.theme = $scope.currentTheme;

			$scope.currentTheme = jQuery('#themeSelector :checked').val();

			steps = [];

			addChat(500, 'me', $scope.themes[$scope.currentTheme] + "! Si je veux trouver des infos sur ce sujet-là, je fais comment ?");
			addChat(1500, 'other', "Tu ouvres grands tes yeux... et tu fais marcher ton cerveau ! En lisant les Cuitts, tu pourras déterminer de quoi ils parlent.");

			addChat(1500, 'me', "Hum... pas facile !");
			addChat(1500, 'other', "Je vois. Si tu as un doute, tu peux faire une recherche pour vérifier la thématique de chaque Cuitt. Regarde : choisis-en un, n’importe lequel !");

			addStep(1500, function() {
				// show info popup
				$scope.skipCuits = true;
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Vérifier la thématique</strong>";
				$scope.tooltip.position(jQuery('#cuicuiter .cuit').not(".verified-theme").first().find('.metas .theme button'), 0, 100);
				$scope.tooltip.active = true;
				verifyCuitThemeCallback = function() {
					scenarii.level1Phase3();
				};
			});

			addStep(1500, function() {
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

			addChat(1500, 'other', "Et voilà ! Tu vois, ça a pris un peu de temps mais ça en valait la peine ! Maintenant, tu sais que ce cuitt parle de " + selectedCuit.theme + ".");
			addChat(1500, 'other', "Tu vois, c’est signalé par le petit picto qui a remplacé le point d’interrogation en dessous du message !");

			if (selectedCuit.theme === $scope.currentTheme) {
				addChat(1500, 'me', "Ah, géniale, cette info ! justement ce qui m’intéresse !");
			} else {
				addChat(1500, 'me', "Ah ouais... Pas mal, cette info, mais, moi, ce qui m’intéresse, c’est " + $scope.themes[$scope.currentTheme] + ".");
			}
			addChat(1500, 'other', "Ce qui est cool avec Cuicuitter, c’est que je suis sûr qu’en fouillant dans la timeline, tu peux trouver un autre cuit qui parle de " + $scope.themes[$scope.currentTheme] + ". A toi de jouer !");

			addStep(1500, function() {
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

			addStep(1500, function() {
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

			if (selectedCuit.theme === $scope.currentTheme) {
				scenarii.level1Phase5();
				return;
			} else {
				addChat(1500, 'me', "Ah... ce Cuitt-là ne m’intéresse pas trop. Attends, j’en cherche un autre !");
				addStep(1500, function() {
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
					verifyCuitThemeCallback = function() {
						scenarii.level1Phase4();
					};
				});
			}

			addStep(1500, function() {
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

			addChat(1500, 'me', "Ouah, génial ! C’est super intéressant ce truc !.");
			addChat(1500, 'other', "T’as vu ? J’apprends plein d’infos de première fraîcheur depuis que je m’en sers... ");
			addChat(1500, 'other', "Bon, il y a aussi des trucs un peu bidon, mais en général, quand tu vérifies qui poste, tu peux savoir si c’est du solide ou pas...");
			addChat(1500, 'me', "Ah ? Comment on fait ça ?");
			addChat(1500, 'other', "Ben, pour voir la fiche de quelqu’un, il faut cliquer sur sa photo d’avatar ou sur son nom d’utilisateur.");
			addStep(1500, function() {
				addCuit(false, true);
				addCuit(false, true);
				addCuit(false, true);
			});
			addChat(1500, 'other', "Regarde, tu vois le gars qui vient de poster trois messages ? Tu peux cliquer sur sa photo...");
			addStep(1500, function() {
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
			addStep(1500, function() {
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

			addStep(1500, function() {
				// show info popup
				$scope.tooltip.content = "Cliquez maintenant sur le bouton <strong>Analyser la source</strong>";
				$scope.tooltip.position(jQuery('#source .metas .theme button'), 0, 100);
				$scope.tooltip.active = true;
				verifySourceThemeCallback = function() {
					scenarii.level1Phase7();
				};
			});

			addStep(1500, function() {
				if ($scope.debug) {
					// jQuery('#source .metas .theme button').click();
				}
			});

			doSteps();

		};

		scenarii.level1Phase7 = function() {

			$scope.tooltip.active = false;
			verifySourceThemeCallback = false;

			$log.log(">level1Phase7");

			steps = [];

			addChat(1500, 'me', "Ouah, trop cool !");
			addChat(1500, 'other', "T’as vu ? Analyser une source, ça prend du temps, mais après tu connais la thématique de chacun de ses Cuitts !");
			addChat(1500, 'me', "C’est génial, Cuicuitter ! Ca doit être un super outil pour les journalistes, ça !");
			addChat(1500, 'other', "Carrément !");
			addChat(1500, 'me', "Tiens, mais d’ailleurs... Journaliste... Voilà un métier qui me plairait à fond !");

			addChat(1500, 'other', "Ah ouais ? Cool ! Ben voilà, plus besoin de te prendre la tête, tu sais quoi mettre sur ta fiche d’orientation ! Mais tu vas devoir apprendre à maîtriser Cuicuitter à mort, alors !");

			addStep(1500, function() {
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

			$scope.currentTheme = $cookies.theme;

			steps = [];

			addStep(500, function() {
				$scope.openWin('cuicuiter');
			});

			addStep(1500, function() {
				$scope.openWin('chat');
			});

			addChat(1500, 'other', "Salut !");
			addChat(1500, 'me', "Salut ! Ca roule ?");
			addChat(1500, 'other', "Bien, et toi ? Alors, tu révises le concours pour les écoles de journalisme ?");
			addChat(1500, 'me', "Pfff... M’en parle pas, c’est crevant x_x. En plus, j’ai ouvert un blog pour m’entrainer à écrire des articles...");
			addChat(1500, 'other', "Ah bon ? Un blog ? Cool ! Sur quel sujet ?");
			addChat(1500, 'me', "Sur " + $scope.themes[$scope.currentTheme] + ".");
			addChat(1500, 'other', "Ah, j’aurais dû m’en douter ! C’est super ! Comment tu fais pour trouver des sujets ?");
			addChat(1500, 'me', "J’utilise Cuicuitter ! Mais je dois faire gaffe. Si je veux que mes lecteurs soient contents, j’ai intérêt à choisir des infos sur la bonne thématique...");
			addChat(1500, 'other', "Et comment tu fais pour le savoir ?");
			addChat(1500, 'me', "J’analyse chaque info...");
			addChat(1500, 'other', "Tu peux aussi analyser les sources directement en cliquant sur les photos des utilisateurs, tu sais ?");
			addChat(1500, 'me', "Oui ! C’est vrai, c’est très efficace, même si ça prend plus de temps... Allez, d’ailleurs je te laisse, il faut que je me mette au travail.");
			addChat(1500, 'other', "Ok/ Bon courage ;-)");

			addStep(1500, function() {
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
				$scope.tooltip.active = false;
			});

			addStep(1500, function() {
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
				}
			});

			doSteps();

		};

		scenarii.level2End = function() {
			$log.log(">level2Phase2");
			showScoring();
		};

		$scope.posts = [];
		$scope.publishCuit = function(cuit, force) {
			$scope.currentCuit = cuit;

			if ($scope.posts.length === 5) {
				$log.log("already 5 posts");
				$scope.tooltip.content = "vous avez déjà publié 5 articles aurjourd'hui";
				$scope.tooltip.position(jQuery('#blog'), 0, 100);
				$scope.tooltip.active = true;
				$timeout(function() {
					$scope.tooltip.active = false;
				}, 2000);
			} else {

				promptCallback = function() {
					$log.log("publishCuit(", $scope.currentCuit.id);
					var post = {
						cuit: $scope.currentCuit,
						title: $scope.currentCuit.articleTitle
					};
					angular.forEach($scope.cuits, function(c, idx) {
						if (c.id === $scope.currentCuit.id) {
							$scope.cuits[idx].published = true;
						}
					});
					$scope.posts.push(post);
					decrementTime("publish-cuit");
					$scope.closeWin('prompt');
					promptCallback = null;
				};

				$scope.promptContent = "Êtes-vous sûr de vouloir publier ce Cuit ?";
				$scope.openWin('prompt');

				if (force) {
					jQuery('#prompt .confirm').click();
				}
			}

		};
		$scope.unpublish = function(post) {
			$scope.currentPost = post;

			promptCallback = function() {

				$log.log("unpublish(", $scope.currentPost.cuit.id);
				angular.forEach($scope.posts, function(p, idx) {
					if (p.cuit.id === $scope.currentPost.cuit.id) {
						$scope.posts.splice(idx, 1);
						decrementTime("unpublish-cuit");
					}
				});

				$scope.closeWin('prompt');
				promptCallback = null;
			};

			$scope.promptContent = "Êtes-vous sûr de vouloir dépublier cet article ?";
			$scope.openWin('prompt');

			addStep(1500, function() {
				if ($scope.debug) {
					jQuery('#prompt .confirm').click();
				}
			});

		};

		$scope.endDay = function() {
			scenarii['level' + $scope.level + 'End']();
		};

		$scope.nextLevel = function() {
			$cookies.level = parseInt($scope.level, 10) + 1;
			$location.path('/intro');
		};

		function showScoring() {
			$scope.showScoring = true;
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