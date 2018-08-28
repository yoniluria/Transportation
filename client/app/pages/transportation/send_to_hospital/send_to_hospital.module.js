/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.send_to_hospital', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('send_to_hospital', {
          url: '/send_to_hospital',
          templateUrl: 'app/pages/transportation/send_to_hospital/send_to_hospital.html',
          controller: 'SendToHospitalCtrl'
          
        })
        .state('print_page', {
          url: '/print_page',
          templateUrl: 'app/pages/transportation/send_to_hospital/print_page.html',
          controller: 'PrintPageCtrl'
          
        })
      
  }

})();
