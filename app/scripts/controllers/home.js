'use strict';
angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, $log, titleService) {
		$log.log('Home');
		$rootScope.background = 'home';
		titleService.setTitle('Home');
	});