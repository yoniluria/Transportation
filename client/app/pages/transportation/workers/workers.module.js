/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.workers', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('workers', {
          url: '/workers',
          templateUrl: 'app/pages/transportation/workers/workers.html', 
          controller: 'WorkersCtrl' 
          
        })
        .state('guidelines', {
          url: '/guidelines',
          templateUrl: 'app/pages/transportation/workers/guidelines.html', 
          controller: 'GuidelinesCtrl' 
          
        })
      
  }

})();
