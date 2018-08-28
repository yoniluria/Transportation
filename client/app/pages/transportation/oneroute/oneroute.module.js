/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.oneroute', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('oneroute', {
          url: '/oneroute',
          templateUrl: 'app/pages/transportation/oneroute/oneroute.html',
          controller: 'OnerouteCtrl'
          
        })
      
  }

})();
