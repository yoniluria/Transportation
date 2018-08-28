
(function () {
  'use strict';

  angular.module('RouteSpeed.theme.zeroDisplay',[])
  .filter('zeroDisplay', function() {
  	
  return function (number) {
    if(!Number(number)){
    	return '';
    }
    return number;
   }
    
  });

  /** @ngInject */


})();
