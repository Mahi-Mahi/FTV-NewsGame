'use strict';

angular.module('newsGameApp')
	.controller('IntroCtrl', function($scope, $log) {

		$log.log('Intro');

		$scope.level = 1;

	});