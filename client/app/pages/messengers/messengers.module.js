
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.messengers', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider,$urlRouterProvider) {
  	
    $stateProvider
        .state('messengers', {
                 url: '/messengers',
                 abstract: true,
                 templateUrl: 'app/pages/messengers/messengers.html',
                 controller: 'MessengersCtrl'
                 
               })
               .state('messengers.redemptions', {
                 url: '/redemptions/:id',
                 templateUrl: 'app/pages/messengers/redemptions/redemptions.html',
                 controller: 'RedemptionsCtrl',
                 reloadOnSearch: false
                 
               })
               .state('messengers.routes', {
                 url: '/routes/:id',
                 templateUrl: 'app/pages/messengers/routes/routes.html',
                 controller: 'MessengersRoutesCtrl',
                 reloadOnSearch: false
                 
               })
                .state('messengers.details', {
                 url: '/details/:id',
                 templateUrl: 'app/pages/messengers/details/details.html',
                 controller: 'DetailsCtrl'
                 
               })
               /*
                 .state('messengers.redemptionsNew', {
                                url: '/redemptions',
                                templateUrl: 'app/pages/messengers/redemptions/redemptions.html',
                                controller: 'RedemptionsCtrl'
                                
                              })
                              .state('messengers.routesNew', {
                                url: '/routes',
                                templateUrl: 'app/pages/messengers/routes/routes.html',
                                controller: 'MessengersRoutesCtrl'
                                
                              })*/
               
                .state('messengers.detailsNew', {
                 url: '/details',
                 templateUrl: 'app/pages/messengers/details/details.html',
                 controller: 'DetailsCtrl'
                 
               })
                $urlRouterProvider.when('/messengers','/messengers/details');
	
     
      
  }

})();
