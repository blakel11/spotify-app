'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('spotApp', ['ngRoute', 'spotify', 'ngCookies']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'start/start.html',
    controller: 'startCtrl as start'
  })
  .when('/play', {
    templateUrl: 'play/play.html',
    controller: 'playCtrl as play'
  })
  .when('/gameover', {
    templateUrl: 'gameover/gameover.html',
    controller: 'gameoverCtrl as gameover'
  })
  .otherwise({redirectTo: '/' });
}]);
