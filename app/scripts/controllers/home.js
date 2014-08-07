'use strict';
angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, $cookies, $log, titleService) {

		$log.log('Home');

		$rootScope.background = 'home';

		titleService.setTitle('Home');

		// current difficulty level
		$scope.level = $cookies.level ? parseInt($cookies.level, 10) : 1;
		$cookies.level = $scope.level;

	});