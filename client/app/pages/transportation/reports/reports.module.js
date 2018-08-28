/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.reports', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('reports', {
          url: '/reports',
          templateUrl: 'app/pages/transportation/reports/reports.html',
          controller: 'ReportsCtrl'
          
        })
      
  }

})();
