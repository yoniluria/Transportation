/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.definitions', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('definitions', {
          url: '/definitions',
          templateUrl: 'app/pages/transportation/definitions/definitions.html', 
          controller: 'DefinitionsCtrl'  
          
        })
      
  }

})();
