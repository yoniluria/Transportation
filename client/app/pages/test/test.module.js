
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.test', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('test', {
          url: '/test',
          templateUrl: 'app/pages/test/test.html',
          controller: 'TestCtrl'
          
        })
      
  }

})();
