'use strict';

angular
	.module('newsGameApp', [
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngRoute',
		'kendo.directives'
	])
	.config(function(config, $routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/splash.html',
				controller: 'SplashCtrl'
			})
			.when('/intro', {
				templateUrl: 'views/intro.html',
				controller: 'IntroCtrl'
			})
			.when('/play', {
				templateUrl: 'views/main.html',
				controller: 'MainCtrl',
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