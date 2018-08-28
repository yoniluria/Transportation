/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.shifts', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('shifts', {
          url: '/shifts',
          templateUrl: 'app/pages/transportation/shifts/shifts.html', 
          controller: 'shiftsCtrl'  
          
        })
      
  }

})();