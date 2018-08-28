/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.sort', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('sort', {
          url: '/sort',
          templateUrl: 'app/pages/transportation/sort/sort.html', 
          controller: 'SortCtrl'  
          
        })
      
  }

})();
