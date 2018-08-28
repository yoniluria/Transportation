
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.dashbord', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('dashbord', {
          url: '/dashbord',
          templateUrl: 'app/pages/dashbord/dashbord.html',
          controller: 'DashbordCtrl'
          
        })
      
  }

})();
