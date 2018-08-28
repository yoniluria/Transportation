
(function () {
  'use strict';

  angular.module('RouteSpeed.theme', [
     'RouteSpeed.theme.twoCities',
     'RouteSpeed.theme.zeroDisplay'
  ])
  .config(routeConfig).run(function($rootScope, $window, $http, $location,$filter, connectGETService, editableOptions){
  	
  });

	/** @ngInject */
	function routeConfig($urlRouterProvider, $stateProvider, $mdDateLocaleProvider) {

	}

})();
