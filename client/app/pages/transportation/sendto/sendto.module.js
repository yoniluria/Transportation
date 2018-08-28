/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.sendto', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('sendto', {
          url: '/sendto',
          templateUrl: 'app/pages/transportation/sendto/sendto.html',
          controller: 'SendtoCtrl'
          
        })
      
  }

})();
