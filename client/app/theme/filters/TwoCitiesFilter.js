
(function () {
  'use strict';

  angular.module('RouteSpeed.theme.twoCities',[])
  .filter('TwoCities', function() {
  	
  return function (cities) {
    if(cities && typeof cities=='string'){
    	var citiesArray = cities.split(',');
    	if(citiesArray[0] && citiesArray[1]){
    		return citiesArray[0] + ', ' + citiesArray[1];
    	}
    	if(citiesArray[0]){
    		return citiesArray[0];
    	}
    	return '';
    }
    return '';
   }
    
  });

  /** @ngInject */


})();
