/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.distances', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('distances', {
          url: '/distances',
          templateUrl: 'app/pages/transportation/distances/distances.html', 
          controller: 'DistancesCtrl'  
          
        })
      
  }

})();
