/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.orders', [

  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
  	
    $stateProvider
        .state('orders', {
          url: '/orders',
          templateUrl: 'app/pages/orders/orders.html',
          controller: 'OrdersCtrl'
          
        })
        .state('ordersEdit', {
             url: '/orders/:id',
             templateUrl: 'app/pages/orders/orders.html',
             controller: 'OrdersCtrl'
                 
         })
      
  }

})();
