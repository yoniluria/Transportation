
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.routes', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('routes', {
          url: '/routes',
          templateUrl: 'app/pages/routes/routes.html',
          controller: 'RoutesCtrl'
          
        })
      
  }

})();
