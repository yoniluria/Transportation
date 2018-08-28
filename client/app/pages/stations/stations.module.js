/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.stations', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('stations', {
          url: '/stations',
          templateUrl: 'app/pages/stations/stations.html',
          controller: 'StationsCtrl'
          
        })
      
  }

})();
