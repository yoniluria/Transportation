
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.settings', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('settings', {
          url: '/settings',
          templateUrl: 'app/pages/settings/settings.html',
          controller: 'SettingsCtrl'
          
        })
      
  }

})();
