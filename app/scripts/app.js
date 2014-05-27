'use strict';

angular
  .module('newsGameApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'kendo.directives'
  ])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });