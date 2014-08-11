'use strict';
angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, ipCookie, $log, $location, titleService) {

		$log.log('Home');

		$rootScope.background = 'home';

		titleService.setTitle('Accueil');

		// current difficulty level
		$scope.level = ipCookie('level') ? parseInt(ipCookie('level'), 10) : 1;
		ipCookie('level', $scope.level, {
			expires: 365
		});

		$scope.newGame = function() {
			ipCookie('level', 1, {
				expires: 365
			});
			ipCookie('scores', {}, {
				expires: 365
			});
			ipCookie('theme', null, {
				expires: 365
			});
			ipCookie('mandatory', null, {
				expires: 365
			});
			$location.path("/intro");
		};

	});