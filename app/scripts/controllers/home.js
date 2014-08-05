'use strict';
angular.module('newsGameApp')
	.controller('HomeCtrl', function($rootScope, $scope, $log) {
		$log.log('Home');
		$rootScope.background = 'home';
	});