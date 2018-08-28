
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.stations')
      .controller('StationsCtrl', StationsCtrl);

  /** @ngInject */
  function StationsCtrl($scope,$rootScope,$http,$location,$state) {
    	$rootScope.module=        'stations';
    	$scope.controller=   	   'stations';
    
  }

})();
