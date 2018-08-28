
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.login', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('/login', {
          url: '/login',
          templateUrl: 'app/pages/login/login.html',
          controller: 'LoginCtrl'
          
        })
      
  }

})();
