'use strict';

angular.module('newsGameApp')
	.controller('OutroCtrl', function($rootScope, $scope, $routeParams, ipCookie, $log, $location, $timeout, $interval, $q, dataService, titleService, utils) {

		$log.log('Outro');

		titleService.setTitle('Outro');

		$scope.debug = ($routeParams.debug);

		// current difficulty level
		$scope.level = ipCookie('level') ? parseInt(ipCookie('level'), 10) : 1;
		ipCookie('level', $scope.level, {
			expires: 365
		});

	});