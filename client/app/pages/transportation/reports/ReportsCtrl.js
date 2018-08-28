
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.reports')
      .controller('ReportsCtrl', ReportsCtrl);
  /** @ngInject */
  function ReportsCtrl($scope,$rootScope,$http,$location,$state,$filter) {
    	$rootScope.module=        'reports';
    	$scope.controller=   	   'reports';
    	$rootScope.headline='דוחות';
		
  }

})();
