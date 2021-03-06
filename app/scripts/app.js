'use strict';

angular
	.module('newsGameApp', [
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngRoute',
		'kendo.directives',
		'duScroll',
		'ngAnimate',
		'ipCookie',
		'ngStorage'
	])
	.config(function(config, $routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/home.html',
				controller: 'HomeCtrl'
			})
			.when('/intro/:debug?', {
				templateUrl: 'views/intro.html',
				controller: 'IntroCtrl',
				resolve: {
					load: function($route, dataService) {
						return dataService.load('all');
					}
				}
			})
			.when('/play/:debug?', {
				templateUrl: 'views/play.html',
				controller: 'PlayCtrl',
				resolve: {
					load: function($route, dataService) {
						return dataService.load('all');
					}
				}
			})
			.when('/outro/:debug?', {
				templateUrl: 'views/outro.html',
				controller: 'OutroCtrl',
				resolve: {
					load: function($route, dataService) {
						return dataService.load('all');
					}
				}
			})
			.when('/score/:debug?', {
				templateUrl: 'views/score.html',
				controller: 'ScoreCtrl',
				resolve: {
					load: function($route, dataService) {
						return dataService.load('all');
					}
				}
			})
			.otherwise({
				redirectTo: '/'
			});
	});