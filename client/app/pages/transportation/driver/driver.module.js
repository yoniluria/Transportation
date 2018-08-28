/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.driver', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('driver', {
          url: '/driver',
          templateUrl: 'app/pages/transportation/driver/driver.html', 
          controller: 'DriverCtrl'  
          
        })
      
  }

})();
