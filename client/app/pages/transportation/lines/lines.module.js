/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.lines', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('lines', {
          url: '/lines',
          templateUrl: 'app/pages/transportation/lines/lines.html', 
          controller: 'LinesCtrl'  
          
        })
      
  }

})();
