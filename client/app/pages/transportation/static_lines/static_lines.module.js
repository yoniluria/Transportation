/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.static_lines', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('static_lines', {
          url: '/static_lines',
          templateUrl: 'app/pages/transportation/static_lines/static_lines.html', 
          controller: 'Static_linesCtrl'  
          
        })
      
  }

})();
