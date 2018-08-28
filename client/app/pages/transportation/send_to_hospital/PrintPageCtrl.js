
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.send_to_hospital')
      .controller('PrintPageCtrl', PrintPageCtrl);
  /** @ngInject */
  function PrintPageCtrl($scope,$rootScope,$http,$location,$state,$filter) {
		function init(){
			window.print();
		}
		init();
  }

})();
